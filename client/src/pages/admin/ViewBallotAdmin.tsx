import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Paper, 
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    useTheme,
    Chip,
    Stack,
    Card,
    CardContent,
    LinearProgress,
    Skeleton,
    Fade,
    Avatar,
    IconButton,
    Tooltip,
    alpha
} from '@mui/material';
import type { GridProps } from '@mui/material';
import {
    AccessTime as AccessTimeIcon,
    Description as DescriptionIcon,
    Category as CategoryIcon,
    Ballot as BallotIcon,
    HowToVote as HowToVoteIcon,
    Edit as EditIcon,
    Preview as PreviewIcon,
    Group as GroupIcon,
    Shield as ShieldIcon
} from '@mui/icons-material';
import { PageHeader } from '../../components/PageHeader';
import API from '../../api/axios';
import { format } from 'date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Colors
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MockChip } from '../../components/MockChip';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ChartTooltip,
    Legend,
    Colors
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

interface Role {
    id: number;
    name: string;
    description?: string;
}

interface VotingOption {
    id: number;
    title: string;
}

interface Category {
    id: number;
    name: string;
    roles: Role[];
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
    roles: Role[];
    categoryId: number;
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
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [category, setCategory] = useState<Category | null>(null);
    const theme = useTheme();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ballotResponse = await API.get(`/ballots/${id}`);
                setBallot(ballotResponse.data);
                
                // Fetch category data to get available roles
                const categoriesResponse = await API.get('/categories');
                const categories = categoriesResponse.data.categories;
                const ballotCategory = categories.find((cat: Category) => cat.id === ballotResponse.data.categoryId);
                setCategory(ballotCategory || null);
                
                setLoading(false);

                // Fetch analytics separately to show ballot details faster
                const analyticsResponse = await API.get(`/ballots/${id}/analytics`);
                setAnalytics(analyticsResponse.data);
                setAnalyticsLoading(false);
            } catch (err: any) {
                console.error('Error fetching ballot data:', err);
                setError(err.response?.data?.message || 'Failed to load ballot data');
                setLoading(false);
                setAnalyticsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const getStatusColor = (status: string | undefined) => {
        if (!status) return theme.palette.text.primary;
        
        switch (status.toLowerCase()) {
            case 'active': return theme.palette.success.main;
            case 'ended': return theme.palette.error.main;
            case 'suspended': return theme.palette.warning.main;
            default: return theme.palette.text.primary;
        }
    };

    const getStatusBgColor = (status: string | undefined) => {
        if (!status) return theme.palette.grey[100];
        
        switch (status.toLowerCase()) {
            case 'active': return theme.palette.success.light;
            case 'ended': return theme.palette.error.light;
            case 'suspended': return theme.palette.warning.light;
            default: return theme.palette.grey[100];
        }
    };

    const choiceDistributionData = analytics && ballot?.type !== 'TEXT_INPUT' && ballot?.type !== 'RANKED_CHOICE' ? {
        labels: analytics.choiceDistribution.map(choice => choice.title),
        datasets: [{
            label: 'Votes',
            data: analytics.choiceDistribution.map(choice => choice.votes),
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
            borderRadius: 4
        }]
    } : null;

    const hourlyDistributionData = analytics ? {
        labels: analytics.hourlyDistribution.map(hour => `${hour.hour}:00`),
        datasets: [{
            label: 'Votes per Hour',
            data: analytics.hourlyDistribution.map(hour => hour.votes),
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
            borderRadius: 4
        }]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: theme.palette.background.paper,
                titleColor: theme.palette.text.primary,
                bodyColor: theme.palette.text.secondary,
                borderColor: theme.palette.divider,
                borderWidth: 1,
                padding: 12,
                boxPadding: 6
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    color: theme.palette.text.secondary
                },
                grid: {
                    color: theme.palette.divider
                }
            },
            x: {
                ticks: {
                    color: theme.palette.text.secondary
                },
                grid: {
                    color: theme.palette.divider
                }
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <PageHeader title="View Ballot (Admin)" />
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={200} />
                </Paper>
            </Box>
        );
    }

    if (error || !ballot) {
        return (
            <Box sx={{ p: 3 }}>
                <PageHeader title="View Ballot (Admin)" />
                <Alert severity="error" elevation={2} sx={{ mt: 2 }}>
                    {error || 'Ballot not found'}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader 
                title={ballot.title}
                action={
                    <Chip 
                        label={ballot.status}
                        sx={{ 
                            color: getStatusColor(ballot.status),
                            bgcolor: alpha(getStatusBgColor(ballot.status), 0.25),
                            fontWeight: 'medium',
                            px: 1
                        }}
                    />
                }
            />
              <Box sx={{ width: '100%' }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                    aria-label="ballot tabs"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab 
                        label="Details" 
                        icon={<PreviewIcon />} 
                        iconPosition="start"
                        {...a11yProps(0)} 
                    />
                    <Tab 
                        label="Analytics" 
                        icon={<EditIcon />} 
                        iconPosition="start"
                        {...a11yProps(1)} 
                    />
                </Tabs>

                <Box 
                    role="tabpanel" 
                    hidden={activeTab !== 0} 
                    id="ballot-tabpanel-0"
                    aria-labelledby="ballot-tab-0"
                    sx={{ mt: 3 }}
                >
                    {activeTab === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                            <Box sx={{ flex: 1 }}>
                                <Stack spacing={3}>
                                    {/* Details section */}
                                    <Box>
                                        <Typography 
                                            variant="subtitle1" 
                                            color="primary"
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                mb: 2
                                            }}
                                        >
                                            <DescriptionIcon sx={{ mr: 1 }} />
                                            Description
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                            {ballot.description}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography 
                                            variant="subtitle1" 
                                            color="primary"
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                mb: 2
                                            }}
                                        >
                                            <CategoryIcon sx={{ mr: 1 }} />
                                            Ballot Details
                                        </Typography>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary"
                                                    sx={{ mt: 0.5 }}
                                                >
                                                    Type:
                                                </Typography>
                                                <MockChip 
                                                    label={ballot.type.replace(/_/g, ' ')}
                                                    variant="info"
                                                    size='small'
                                                />
                                            </Box>
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        color="text.secondary"
                                                        sx={{ mt: 0.5 }}
                                                    >
                                                        Category:
                                                    </Typography>
                                                    <Typography 
                                                        variant="body1"
                                                        sx={{ mt: 0.25 }}
                                                    >
                                                        {category?.name}
                                                    </Typography>
                                                </Box>
                                                {category && (
                                                    <Stack 
                                                        direction="row" 
                                                        spacing={1} 
                                                        flexWrap="wrap"
                                                    >
                                                        {category.roles?.map((role) => (
                                                            <Tooltip key={role.id} title={role.description || ''} arrow>
                                                                <Box>
                                                                    <MockChip 
                                                                        label={role.name} 
                                                                        variant="info" 
                                                                        size="small" 
                                                                    />
                                                                </Box>
                                                            </Tooltip>
                                                        ))}
                                                        {(!category.roles || category.roles.length === 0) && (
                                                            <Typography 
                                                                variant="body2" 
                                                                color="text.secondary" 
                                                                sx={{ fontStyle: 'italic' }}
                                                            >
                                                                No roles available in this category
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                )}
                                            </Box>
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography 
                                            variant="subtitle1" 
                                            color="primary"
                                            sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                mb: 2
                                            }}
                                        >
                                            <AccessTimeIcon sx={{ mr: 1 }} />
                                            End date
                                        </Typography>
                                        <Stack spacing={2}>
                                                <Typography variant="body1">
                                                    {format(new Date(ballot.endDate), 'PPP')}
                                                </Typography>
                                        </Stack>
                                    </Box>

                                   
                                </Stack>
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <Typography 
                                    variant="subtitle1" 
                                    color="primary"
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        mb: 3
                                    }}
                                >
                                    <BallotIcon sx={{ mr: 1 }} />
                                    Voting Options
                                </Typography>
                                <Stack spacing={2}>
                                    {ballot.options.map((option, index) => (
                                        <Paper 
                                            key={option.id}
                                            elevation={1}
                                            sx={{ 
                                                p: 2,
                                                bgcolor: 'background.default',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Avatar 
                                                    sx={{ 
                                                        bgcolor: theme.palette.secondary.main,
                                                        color: theme.palette.secondary.contrastText,
                                                        width: 32,
                                                        height: 32
                                                    }}
                                                >
                                                    {index + 1}
                                                </Avatar>
                                                <Typography sx={{ flex: 1 }}>
                                                    {option.title}
                                                </Typography>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </Box>
                    )}
                </Box>

                <Box 
                    role="tabpanel" 
                    hidden={activeTab !== 1} 
                    id="ballot-tabpanel-1"
                    aria-labelledby="ballot-tab-1"
                    sx={{ mt: 3 }}
                >
                    {activeTab === 1 && (
                        <>
                            {analyticsLoading ? (
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton variant="rectangular" height={300} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton variant="rectangular" height={300} />
                                    </Box>
                                </Box>
                            ) : analytics ? (                                <Fade in={!analyticsLoading}>
                                    <Box sx={{ 
                                        display: 'grid',
                                        gap: 3,
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            sm: '200px 1fr',
                                            lg: '200px 1fr 1fr'
                                        }
                                    }}>                                        <Card elevation={2} sx={{ height: '100%' }}>
                                            <CardContent sx={{ 
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 2
                                            }}>
                                                <Typography 
                                                    variant="subtitle2" 
                                                    color="primary"
                                                    sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center',
                                                        gap: 0.5
                                                    }}
                                                >
                                                    <HowToVoteIcon fontSize="small" />
                                                    Participation
                                                </Typography>

                                                <Box sx={{ 
                                                    position: 'relative',
                                                    display: 'inline-flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <CircularProgress
                                                        variant="determinate"
                                                        value={analytics.participationRate * 100}
                                                        size={120}
                                                        thickness={4}
                                                        sx={{
                                                            color: theme.palette.primary.main,
                                                            backgroundColor: theme.palette.background.paper,
                                                            borderRadius: '50%'
                                                        }}
                                                    />
                                                    <Box sx={{
                                                        top: 0,
                                                        left: 0,
                                                        bottom: 0,
                                                        right: 0,
                                                        position: 'absolute',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <Typography variant="h4" component="div" color="primary" sx={{ lineHeight: 1, mb: 0.5 }}>
                                                            {(analytics.participationRate * 100).toFixed(1)}%
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Typography variant="caption" color="secondary" align="center" sx={{ mt: 1 }}>
                                                    {analytics.totalVotes} of {analytics.eligibleUsers} users
                                                </Typography>
                                            </CardContent>
                                        </Card>

                                        {choiceDistributionData && (
                                            <Card elevation={2}>
                                                <CardContent>
                                                    <Typography 
                                                        variant="h6" 
                                                        gutterBottom 
                                                        color="primary"
                                                        sx={{ mb: 2 }}
                                                    >
                                                        Choice Distribution
                                                    </Typography>
                                                    <Box sx={{ height: { xs: 250, sm: 300 } }}>
                                                        <Bar data={choiceDistributionData} options={chartOptions} />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        )}

                                        <Card elevation={2}>
                                            <CardContent>
                                                <Typography 
                                                    variant="h6" 
                                                    gutterBottom 
                                                    color="primary"
                                                    sx={{ mb: 2 }}
                                                >
                                                    Voting Activity
                                                </Typography>
                                                <Box sx={{ height: { xs: 250, sm: 300 } }}>
                                                    <Bar data={hourlyDistributionData} options={chartOptions} />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                </Fade>
                            ) : (
                                <Alert severity="info">
                                    No analytics data available for this ballot.
                                </Alert>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ViewBallotAdmin;
