import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Tabs,
    Tab,
    Typography,
    Container,
    Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PageHeader } from '../../components/PageHeader';
import { BallotCard } from '../../components/BallotCard';
import axiosInstance from '../../api/axios';

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
            id={`ballots-tabpanel-${index}`}
            aria-labelledby={`ballots-tab-${index}`}
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
        id: `ballots-tab-${index}`,
        'aria-controls': `ballots-tabpanel-${index}`,
    };
}

export const ManageCategories = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [activeBallotsData, setActiveBallotsData] = useState([]);
    const [pastBallotsData, setPastBallotsData] = useState([]);
    const [suspendedBallotsData, setSuspendedBallotsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBallots = async () => {
            try {
                setLoading(true);
                // Fetch active ballots
                const activeResponse = await axiosInstance.get('/ballots/active');
                setActiveBallotsData(activeResponse.data);

                // Fetch past ballots
                const pastResponse = await axiosInstance.get('/ballots/past');
                setPastBallotsData(pastResponse.data);

                // Fetch suspended ballots
                const suspendedResponse = await axiosInstance.get('/ballots/suspended');
                setSuspendedBallotsData(suspendedResponse.data);
            } catch (error) {
                console.error('Error fetching ballots:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBallots();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleCreateBallot = () => {
        // TODO: Implement create ballot functionality
        console.log('Create ballot clicked');
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <PageHeader 
                    title="Manage Categories" 
                    action={
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateBallot}
                        >
                            Create New Ballot
                        </Button>
                    }
                />
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="ballot tabs"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Active Ballots" {...a11yProps(0)} />
                    <Tab label="Past Ballots" {...a11yProps(1)} />
                    <Tab label="Suspended Ballots" {...a11yProps(2)} />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                    {loading ? (
                        <Typography>Loading active ballots...</Typography>
                    ) : activeBallotsData.length > 0 ? (
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {activeBallotsData.map((ballot: any) => (
                                <BallotCard key={ballot.id} ballot={ballot} />
                            ))}
                        </Box>
                    ) : (
                        <Typography>No active ballots found.</Typography>
                    )}
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    {loading ? (
                        <Typography>Loading past ballots...</Typography>
                    ) : pastBallotsData.length > 0 ? (
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {pastBallotsData.map((ballot: any) => (
                                <BallotCard key={ballot.id} ballot={ballot} />
                            ))}
                        </Box>
                    ) : (
                        <Typography>No past ballots found.</Typography>
                    )}
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    {loading ? (
                        <Typography>Loading suspended ballots...</Typography>
                    ) : suspendedBallotsData.length > 0 ? (
                        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {suspendedBallotsData.map((ballot: any) => (
                                <BallotCard key={ballot.id} ballot={ballot} />
                            ))}
                        </Box>
                    ) : (
                        <Typography>No suspended ballots found.</Typography>
                    )}
                </TabPanel>
            </Paper>
        </Container>
    );
};
