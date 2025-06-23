import React, { useState, useEffect, useCallback } from "react";
import {
	Box,
	Button,
	Tabs,
	Tab,
	Typography,
	Paper,
	CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { PageHeader } from "../components/PageHeader";
import { BallotCard } from "../components/BallotCard";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
	contentContainerStyle,
	scrollableContentStyle,
} from "../styles/scrollbar";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

interface Ballot {
	id: number;
	title: string;
	description: string;
	status: string;
	type: string;
	startDate: Date;
	endDate: Date;
	categoryId: number;
	[key: string]: any;
}

interface ActiveBallotsData {
	voted: Ballot[];
	unvoted: Ballot[];
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
		"aria-controls": `ballots-tabpanel-${index}`,
	};
}

export const BallotsList = () => {
	const [activeTab, setActiveTab] = useState(0);
	const [activeBallotsData, setActiveBallotsData] = useState<
		Ballot[] | ActiveBallotsData
	>([]);
	const [pastBallotsData, setPastBallotsData] = useState<Ballot[]>([]); // Can be array for admin or ActiveBallotsData for users
	const [suspendedBallotsData, setSuspendedBallotsData] = useState<Ballot[]>(
		[]
	);
	const [loading, setLoading] = useState(true);
	const { isAdmin, user } = useAuth();
	const navigate = useNavigate();

	const fetchBallots = useCallback(async () => {
		try {
			setLoading(true);

			if (!user) {
				console.log("[BallotsList] No user found, skipping ballot fetch");
				return;
			}

			const cacheKey = `ballots-list-${isAdmin() ? "admin" : "user"}-${
				user.id
			}`;
			const cachedData = sessionStorage.getItem(cacheKey);
			const cachedTimestamp = sessionStorage.getItem(cacheKey + "-timestamp");

			// Use cached data if less than 30 seconds old
			if (cachedData && cachedTimestamp) {
				const age = Date.now() - parseInt(cachedTimestamp);
				if (age < 30000) {
					// 30 seconds
					console.log(
						"[BallotsList] Using cached ballot data, age:",
						age,
						"ms"
					);
					const data = JSON.parse(cachedData);
					setActiveBallotsData(data.active);
					setPastBallotsData(data.past);
					setSuspendedBallotsData(data.suspended);
					setLoading(false);
					return;
				}
			}

			// Fetch active ballots
			const activeEndpoint = isAdmin()
				? "/ballots/active"
				: "/ballots/active-with-status";
			const activeResponse = await API.get(activeEndpoint);
			setActiveBallotsData(
				isAdmin()
					? activeResponse.data
					: {
							voted: activeResponse.data.voted,
							unvoted: activeResponse.data.unvoted,
					  }
			); // Fetch past ballots
			const pastEndpoint = "/ballots/past";
			const pastResponse = await API.get(pastEndpoint);
			setPastBallotsData(pastResponse.data);

			// Fetch suspended ballots
			const suspendedEndpoint = "/ballots/suspended";
			const suspendedResponse = await API.get(suspendedEndpoint);
			setSuspendedBallotsData(suspendedResponse.data);

			// Cache the new data
			const cacheData = {
				active: activeResponse.data,
				past: pastResponse.data,
				suspended: suspendedResponse.data,
			};
			sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
			sessionStorage.setItem(cacheKey + "-timestamp", Date.now().toString());
		} catch (error) {
			console.error("[BallotsList] Error fetching ballots:", error);
		} finally {
			setLoading(false);
		}
	}, [isAdmin, user]);

	useEffect(() => {
		fetchBallots();
	}, [fetchBallots]);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	const handleCreateBallot = () => {
		navigate("/admin/ballots/new");
	};

	const handleRefresh = () => {
		// Clear cache to force a fresh fetch
		if (user) {
			const cacheKey = `ballots-list-${isAdmin() ? "admin" : "user"}-${
				user.id
			}`;
			sessionStorage.removeItem(cacheKey);
			sessionStorage.removeItem(cacheKey + "-timestamp");
		}
		fetchBallots();
	};

	const renderActiveBallotsContent = () => {
		if (loading) {
			return (
				<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
					<CircularProgress />
				</Box>
			);
		}

		if (isAdmin()) {
			const ballots = activeBallotsData as Ballot[];
			if (ballots.length === 0) {
				return <Typography>No active ballots found.</Typography>;
			}

			return (
				<Box
					sx={{
						display: "grid",
						gap: 2,
						gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
					}}
				>
					{ballots.map((ballot: Ballot) => (
						<BallotCard key={ballot.id} ballot={ballot} />
					))}
				</Box>
			);
		} else {
			const { voted, unvoted } = activeBallotsData as ActiveBallotsData;
			const hasNoBallots = voted.length === 0 && unvoted.length === 0;

			if (hasNoBallots) {
				return <Typography>No active ballots found.</Typography>;
			}

			return (
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						gap: 3,
					}}
				>
					<Box sx={{ flex: 1 }}>
						<Typography variant="h6" gutterBottom color="primary">
							Awaiting Your Vote
						</Typography>
						{unvoted.length === 0 ? (
							<Typography color="text.secondary">
								You've voted on all available ballots!
							</Typography>
						) : (
							<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
								{" "}
								{unvoted.map((ballot: Ballot) => (
									<BallotCard
										key={ballot.id}
										ballot={ballot}
										hasVoted={false}
									/>
								))}
							</Box>
						)}
					</Box>
					<Box sx={{ flex: 1 }}>
						<Typography variant="h6" gutterBottom color="primary">
							Already Voted
						</Typography>
						{voted.length === 0 ? (
							<Typography color="text.secondary">
								You haven't voted on any active ballots yet.
							</Typography>
						) : (
							<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
								{voted.map((ballot: Ballot) => (
									<BallotCard key={ballot.id} ballot={ballot} hasVoted={true} />
								))}
							</Box>
						)}
					</Box>
				</Box>
			);
		}
	};

	const renderPastBallotsContent = () => {
		if (loading) {
			return (
				<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
					<CircularProgress />
				</Box>
			);
		}

		const ballots = pastBallotsData as Ballot[];
		if (ballots.length === 0) {
			return (
				<Typography variant="subtitle1" sx={{ p: 3 }}>
					No past ballots found.
				</Typography>
			);
		}

		return (
			<Box
				sx={{
					display: "grid",
					gap: 2,
					gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
				}}
			>
				{ballots.map((ballot) => (
					<BallotCard key={ballot.id} ballot={ballot} />
				))}
			</Box>
		);
	};

	const renderSuspendedBallotsContent = () => {
		if (loading) {
			return (
				<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
					<CircularProgress />
				</Box>
			);
		}

		const ballots = suspendedBallotsData as Ballot[];
		if (ballots.length === 0) {
			return (
				<Typography variant="subtitle1" sx={{ p: 3 }}>
					No suspended ballots found.
				</Typography>
			);
		}

		return (
			<Box
				sx={{
					display: "grid",
					gap: 2,
					gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
				}}
			>
				{ballots.map((ballot) => (
					<BallotCard key={ballot.id} ballot={ballot} />
				))}
			</Box>
		);
	};

	return (
		<Box sx={contentContainerStyle}>
			<PageHeader
				title={isAdmin() ? "Manage Ballots" : "Ballots"}
				onRefresh={handleRefresh}
				isRefreshing={loading}
				action={
					isAdmin() ? (
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleCreateBallot}
						>
							Create New Ballot
						</Button>
					) : undefined
				}
			/>
			<Paper
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
				}}
			>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					aria-label="ballot tabs"
					sx={{ borderBottom: 1, borderColor: "divider" }}
				>
					<Tab label="Active Ballots" {...a11yProps(0)} />
					<Tab label="Past Ballots" {...a11yProps(1)} />
					<Tab label="Suspended Ballots" {...a11yProps(2)} />
				</Tabs>

				<Box sx={scrollableContentStyle}>
					<TabPanel value={activeTab} index={0}>
						{renderActiveBallotsContent()}
					</TabPanel>
					<TabPanel value={activeTab} index={1}>
						{renderPastBallotsContent()}
					</TabPanel>
					<TabPanel value={activeTab} index={2}>
						{renderSuspendedBallotsContent()}
					</TabPanel>
				</Box>
			</Paper>
		</Box>
	);
};
