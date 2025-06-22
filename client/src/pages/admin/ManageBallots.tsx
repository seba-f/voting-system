import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Tabs,
	Tab,
	Typography,
	Paper,
} from "@mui/material";
import {
	Add as AddIcon,
} from "@mui/icons-material";
import { PageHeader } from "../../components/PageHeader";
import { BallotCard } from "../../components/BallotCard";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { contentContainerStyle, scrollableContentStyle } from "../../styles/scrollbar";

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
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `ballots-tab-${index}`,
		"aria-controls": `ballots-tabpanel-${index}`,
	};
}

export const ManageBallots = () => {
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
				const activeResponse = await API.get("/ballots/active");
				setActiveBallotsData(activeResponse.data);

				// Fetch past ballots
				const pastResponse = await API.get("/ballots/past");
				setPastBallotsData(pastResponse.data);

				// Fetch suspended ballots
				const suspendedResponse = await API.get("/ballots/suspended");
				setSuspendedBallotsData(suspendedResponse.data);
			} catch (error) {
				console.error("Error fetching ballots:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchBallots();
	}, []);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};
	const navigate = useNavigate();

	const handleCreateBallot = () => {
		navigate("/admin/ballots/new");
	};
	const handleRefresh = () => {
		const fetchBallots = async () => {
			try {
				setLoading(true);
				const activeResponse = await API.get("/ballots/active");
				setActiveBallotsData(activeResponse.data);

				const pastResponse = await API.get("/ballots/past");
				setPastBallotsData(pastResponse.data);

				const suspendedResponse = await API.get("/ballots/suspended");
				setSuspendedBallotsData(suspendedResponse.data);
			} catch (error) {
				console.error("Error fetching ballots:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchBallots();
	};
	return (
		<Box sx={contentContainerStyle}>
			<PageHeader
				title="Manage Ballots"
				onRefresh={handleRefresh}
				isRefreshing={loading}
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
			<Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					aria-label="ballot tabs"
					sx={{ borderBottom: 1, borderColor: "divider", mb:1 }}
				>
					<Tab label="Active Ballots" {...a11yProps(0)} />
					<Tab label="Past Ballots" {...a11yProps(1)} />
					<Tab label="Suspended Ballots" {...a11yProps(2)} />
				</Tabs>

				<Box sx={scrollableContentStyle}>
					<TabPanel value={activeTab} index={0}>
						{activeBallotsData.length > 0 ? (
							<Box sx={{
								display: "grid",
								gap: 2,
								gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
							}}>
								{activeBallotsData.map((ballot: any) => (
									<BallotCard key={ballot.id} ballot={ballot} />
								))}
							</Box>
						) : (
							<Typography>No active ballots found.</Typography>
						)}
					</TabPanel>
					<TabPanel value={activeTab} index={1}>
						{pastBallotsData.length > 0 ? (
							<Box sx={{
								display: "grid",
								gap: 2,
								gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
							}}>
								{pastBallotsData.map((ballot: any) => (
									<BallotCard key={ballot.id} ballot={ballot} />
								))}
							</Box>
						) : (
							<Typography>No past ballots found.</Typography>
						)}
					</TabPanel>
					<TabPanel value={activeTab} index={2}>
						{suspendedBallotsData.length > 0 ? (
							<Box sx={{
								display: "grid",
								gap: 2,
								gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
							}}>
								{suspendedBallotsData.map((ballot: any) => (
									<BallotCard key={ballot.id} ballot={ballot} />
								))}
							</Box>
						) : (
							<Typography>No suspended ballots found.</Typography>
						)}
					</TabPanel>
				</Box>
			</Paper>
		</Box>
	);
};
