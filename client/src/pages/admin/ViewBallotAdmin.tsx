import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Paper, 
    CircularProgress,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    Tabs,
    Tab,
    useTheme
} from '@mui/material';
import { PageHeader } from '../../components/PageHeader';
import API from '../../api/axios';
import { format } from 'date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`ballot-tabpanel-${index}`}
            aria-labelledby={`ballot-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `ballot-tab-${index}`,
        'aria-controls': `ballot-tabpanel-${index}`,
    };
}

interface VotingOption {
    id: number;
    title: string;
}

interface Ballot {
    id: number;
    title: string;
    description: string;
    type: string;
    endDate: string;
    startDate: string;
    status: string;
    options: VotingOption[];
}

interface Analytics {
    totalVotes: number;
    eligibleUsers: number;
    participationRate: number;
    choiceDistribution: Array<{
        optionId: number;
        title: string;
        votes: number;
    }>;
    hourlyDistribution: Array<{
        hour: number;
        votes: number;
    }>;
}

const ViewBallotAdmin: React.FC = () => {
    const { id } = useParams();
    const [ballot, setBallot] = useState<Ballot | null>(null);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const theme = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ballotResponse, analyticsResponse] = await Promise.all([
                    API.get(`/ballots/${id}`),
                    API.get(`/ballots/${id}/analytics`)
                ]);
                
                setBallot(ballotResponse.data);
                setAnalytics(analyticsResponse.data);
            } catch (err: any) {
                console.error('Error fetching ballot data:', err);
                setError(err.response?.data?.message || 'Failed to load ballot data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !ballot) {
        return (
            <Box sx={{ p: 3 }}>
                <PageHeader title="View Ballot (Admin)" />
                <Alert severity="error">
                    {error || 'Ballot not found'}
                </Alert>
            </Box>
        );
    }    const getStatusColor = (status: string | undefined) => {
        if (!status) return 'text.primary';
        
        switch (status.toLowerCase()) {
            case 'active': return 'success.main';
            case 'ended': return 'error.main';
            case 'suspended': return 'warning.main';
            default: return 'text.primary';
        }
    };

    const choiceDistributionData = analytics && ballot.type !== 'TEXT_INPUT' && ballot.type !== 'RANKED_CHOICE' ? {
        labels: analytics.choiceDistribution.map(choice => choice.title),
        datasets: [{
            label: 'Votes',
            data: analytics.choiceDistribution.map(choice => choice.votes),
            backgroundColor: theme.palette.primary.light,
            borderColor: theme.palette.primary.main,
            borderWidth: 1
        }]
    } : null;

    const hourlyDistributionData = analytics ? {
        labels: analytics.hourlyDistribution.map(hour => `${hour.hour}:00`),
        datasets: [{
            label: 'Votes per Hour',
            data: analytics.hourlyDistribution.map(hour => hour.votes),
            backgroundColor: theme.palette.secondary.light,
            borderColor: theme.palette.secondary.main,
            borderWidth: 1
        }]
    } : null;

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader title="View Ballot (Admin)" />
            
            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                    aria-label="ballot tabs"
                >
                    <Tab label="Details" {...a11yProps(0)} />
                    <Tab label="Analytics" {...a11yProps(1)} />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                    <List>
                        <ListItem>
                            <ListItemText 
                                primary="Title"
                                secondary={ballot.title}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="Description"
                                secondary={ballot.description}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="Type"
                                secondary={ballot.type.replace(/_/g, ' ').toLowerCase()}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="Status"
                                secondary={
                                    <Typography sx={{ color: getStatusColor(ballot.status) }}>
                                        {ballot.status}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="Start Date"
                                secondary={format(new Date(ballot.startDate), 'PPP')}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText 
                                primary="End Date"
                                secondary={format(new Date(ballot.endDate), 'PPP')}
                            />
                        </ListItem>
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" gutterBottom>
                        Options
                    </Typography>
                    <List>
                        {ballot.options.map((option) => (
                            <ListItem key={option.id}>
                                <ListItemText primary={option.title} />
                            </ListItem>
                        ))}
                    </List>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    {analytics ? (
                        <>
                            <Box sx={{ mb: 4 }}>
                                <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        Participation Overview
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Total Participation"
                                                secondary={`${analytics.totalVotes} out of ${analytics.eligibleUsers} eligible users`}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText 
                                                primary="Participation Rate"
                                                secondary={`${(analytics.participationRate * 100).toFixed(1)}%`}
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Box>

                            {choiceDistributionData && (
                                <Box sx={{ mb: 4 }}>
                                    <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            Choice Distribution
                                        </Typography>
                                        <Box sx={{ height: 300 }}>
                                            <Bar data={choiceDistributionData} options={chartOptions} />
                                        </Box>
                                    </Paper>
                                </Box>
                            )}

                            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Voting Activity by Hour
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <Bar data={hourlyDistributionData} options={chartOptions} />
                                </Box>
                            </Paper>
                        </>
                    ) : (
                        <Alert severity="info">
                            No analytics data available for this ballot.
                        </Alert>
                    )}
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default ViewBallotAdmin;
