import { Response } from 'express';
import { AuthRequest } from '../../controllers/authController';
import Ballot from '../../models/entities/voting/ballotModel';
import Vote from '../../models/entities/voting/voteModel';
import VotingOption from '../../models/entities/voting/votingOptionsModel';
import CategoryRoles from '../../models/entities/intermediary/categoryRolesModel';
import UserRoles from '../../models/entities/intermediary/userRolesModel';
import { Op } from 'sequelize';

export const getBallotAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const { id } = req.params;
        const ballot = await Ballot.findByPk(id, {
            include: [
                {
                    model: VotingOption,
                    attributes: ['id', 'title']
                }
            ]
        });

        if (!ballot) {
            res.status(404).json({ message: 'Ballot not found' });
            return;
        }

        // Get category roles to determine eligible users
        const categoryRoles = await CategoryRoles.findAll({
            where: { categoryId: ballot.categoryId },
            attributes: ['roleId']
        });
        const eligibleRoleIds = categoryRoles.map(cr => cr.roleId);

        // Count eligible users (users with any of the eligible roles)
        const eligibleUsers = await UserRoles.count({
            where: {
                roleId: {
                    [Op.in]: eligibleRoleIds
                }
            },
            distinct: true,
            col: 'userId'
        });

        // Get all votes for this ballot
        const votes = await Vote.findAll({
            where: { ballotId: id },
            attributes: [
                'userId',
                'optionId',
                'timestamp'
            ]
        });

        // For ballots with no votes, return minimal analytics
        if (votes.length === 0) {
            const analytics = {
                totalVoters: 0,
                totalVotes: 0,
                eligibleUsers,
                participationRate: 0,
                choiceDistribution: ballot.VotingOptions.map(option => ({
                    optionId: option.id,
                    title: option.title,
                    votes: 0
                })),
                hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
                    hour,
                    votes: 0
                })),
                ...(ballot.ballotType === 'TEXT_INPUT' ? { textResponses: [] } : {})
            };
            res.json(analytics);
            return;
        }

        // Count unique voters
        const uniqueVoters = new Set(votes.map(vote => vote.userId)).size;

        // For text input ballots, get text responses
        let textResponses = [];
        if (ballot.ballotType === 'TEXT_INPUT') {
            const fullVotes = await Vote.findAll({
                where: { ballotId: id },
                attributes: ['textResponse']
            });
            textResponses = fullVotes.filter(v => v.textResponse).map(v => ({
                response: v.textResponse
            }));
        }

        // Calculate analytics based on ballot type
        let choiceDistribution = {};
        let rankDistribution = {};

        if (ballot.ballotType === 'RANKED_CHOICE') {
            // For ranked choice, we need to track rank positions
            // First, group votes by user to get their rankings
            const userVotesMap = votes.reduce((acc, vote) => {
                if (!acc[vote.userId]) {
                    acc[vote.userId] = [];
                }
                acc[vote.userId].push(vote);
                return acc;
            }, {} as { [userId: string]: typeof votes });

            // Then calculate rank distribution from each user's votes
            rankDistribution = Object.values(userVotesMap).reduce((acc, userVotes) => {
                // Sort by timestamp to determine rank (earlier vote = higher rank)
                const sortedVotes = userVotes.sort((a, b) => 
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );

                // Record the rank for each option
                sortedVotes.forEach((v, idx) => {
                    if (!acc[v.optionId]) {
                        acc[v.optionId] = {};
                    }
                    const rank = idx + 1;
                    acc[v.optionId][rank] = (acc[v.optionId][rank] || 0) + 1;
                });
                return acc;
            }, {});
        } else if (ballot.ballotType !== 'TEXT_INPUT') {
            choiceDistribution = votes.reduce((acc, vote) => {
                acc[vote.optionId] = (acc[vote.optionId] || 0) + 1;
                return acc;
            }, {});
        }

        // Calculate voting frequency per hour (using unique voters per hour for multiple choice)
        const votesGroupedByDay = votes.reduce((acc, vote) => {
            const timestamp = new Date(vote.timestamp);
            const dateKey = timestamp.toISOString().split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(vote);
            return acc;
        }, {} as { [key: string]: typeof votes });

        const dateKeys = Object.keys(votesGroupedByDay).sort();
        const hourlyDistributionByDate = dateKeys.map(date => {
            const dayVotes = votesGroupedByDay[date];
            const distribution = dayVotes.reduce((acc, vote) => {
                const timestamp = new Date(vote.timestamp);
                const hour = timestamp.getHours();
            
                if (ballot.ballotType === 'MULTIPLE_CHOICE' || ballot.ballotType === 'RANKED_CHOICE') {
                    // Create a unique key for user and hour
                    const userHourKey = `${vote.userId}-${hour}`;
                    if (!acc.userTracking[userHourKey]) {
                        acc.userTracking[userHourKey] = true;
                        acc.distribution[hour] = (acc.distribution[hour] || 0) + 1;
                    }
                } else {
                    acc.distribution[hour] = (acc.distribution[hour] || 0) + 1;
                }
                return acc;
            }, { distribution: {}, userTracking: {} }).distribution;

            // Ensure all hours are represented
            const fullDistribution = Array.from({ length: 24 }, (_, hour) => ({
                hour,
                votes: distribution[hour] || 0
            }));

            return {
                date,
                hourlyDistribution: fullDistribution
            };
        });

        // Format the response with full analytics
        const baseAnalytics = {
            totalVoters: uniqueVoters,
            totalVotes: votes.length,
            eligibleUsers,
            participationRate: uniqueVoters / eligibleUsers,
            hourlyDistributionByDate: hourlyDistributionByDate,
            hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                votes: votes.filter(v => new Date(v.timestamp).getHours() === hour).length
            }))
        };

        // Add type-specific data
        const analytics = (() => {
            if (ballot.ballotType === 'TEXT_INPUT') {
                return {
                    ...baseAnalytics,
                    textResponses
                };
            } else if (ballot.ballotType === 'RANKED_CHOICE') {
                return {
                    ...baseAnalytics,
                    rankDistribution,
                    choiceDistribution: ballot.VotingOptions.map(option => ({
                        optionId: option.id,
                        title: option.title,
                        votes: Object.values(rankDistribution[option.id] || {}).reduce((sum: number, count) => sum + Number(count), 0)
                    }))
                };
            } else {
                return {
                    ...baseAnalytics,
                    choiceDistribution: ballot.VotingOptions.map(option => ({
                        optionId: option.id,
                        title: option.title,
                        votes: choiceDistribution[option.id] || 0
                    }))
                };
            }
        })();

        res.json(analytics);
    } catch (error: any) {
        console.error('Error fetching ballot analytics:', error);
        res.status(500).json({ 
            message: 'Error fetching ballot analytics', 
            error: error.message 
        });
    }
};
