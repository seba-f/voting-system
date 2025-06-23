import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
	Box,
	Alert,
	Tabs,
	Tab,
	Skeleton,
	Paper,
	useTheme,
} from "@mui/material";
import {
	Edit as EditIcon,
	Preview as PreviewIcon,
} from "@mui/icons-material";
import API from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip as ChartTooltip,
	Legend,
	Colors,
} from "chart.js";
import { PageHeader } from "../../components/PageHeader";
import { BallotHeader } from "../../components/ballot/BallotHeader";
import { BallotDetails } from "../../components/ballot/BallotDetails";
import { VotingOptions } from "../../components/ballot/VotingOptions";
import { BallotAnalytics } from "../../components/ballot/BallotAnalytics";

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
			{value === index && <Box sx={{ p: 3 }}>{children}</Box>}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `ballot-tab-${index}`,
		"aria-controls": `ballot-tabpanel-${index}`,
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
	adminId: number;
	timeLeft?: number | null;
}

interface Analytics {
	totalVotes: number;
	totalVoters: number;
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
	const { user } = useAuth();
	const [ballot, setBallot] = useState<Ballot | null>(null);
	const [analytics, setAnalytics] = useState<Analytics | null>(null);
	const [loading, setLoading] = useState(true);
	const [analyticsLoading, setAnalyticsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState(0);
	const [category, setCategory] = useState<Category | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const ballotResponse = await API.get(`/ballots/${id}`);
				setBallot(ballotResponse.data);

				// Fetch category data to get available roles
				const categoriesResponse = await API.get("/categories");
				const categories = categoriesResponse.data.categories;
				const ballotCategory = categories.find(
					(cat: Category) => cat.id === ballotResponse.data.categoryId
				);
				setCategory(ballotCategory || null);

				setLoading(false);

				// Fetch analytics separately to show ballot details faster
				const analyticsResponse = await API.get(`/ballots/${id}/analytics`);
				setAnalytics(analyticsResponse.data);
				setAnalyticsLoading(false);
			} catch (err: any) {
				console.error("Error fetching ballot data:", err);
				setError(err.response?.data?.message || "Failed to load ballot data");
				setLoading(false);
				setAnalyticsLoading(false);
			}
		};

		fetchData();
	}, [id]);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};	const handleBallotAction = async (action: "end" | "suspend" | "unsuspend") => {
		if (!ballot || isSubmitting) return;

		try {
			setIsSubmitting(true);
			setError(null);

			// Perform the action
			const endpoint = action === "end" ? "end" : action === "suspend" ? "suspend" : "unsuspend";
			const response = await API.post(`/ballots/${ballot.id}/${endpoint}`);
			
			// Refresh ballot data
			const ballotResponse = await API.get(`/ballots/${id}`);
			setBallot(ballotResponse.data);

			// Refresh analytics
			const analyticsResponse = await API.get(`/ballots/${id}/analytics`);
			setAnalytics(analyticsResponse.data);
		} catch (err: any) {
			console.error(`Error ${action}ing ballot:`, err);
			setError(err.response?.data?.message || `Failed to ${action} ballot`);
		} finally {
			setIsSubmitting(false);
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
					{error || "Ballot not found"}
				</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>			<BallotHeader
				title={ballot.title}
				status={ballot.status}
				isAdmin={user?.id === ballot.adminId}
				isSubmitting={isSubmitting}
				onSuspend={() => handleBallotAction("suspend")}
				onUnsuspend={() => handleBallotAction("unsuspend")}
				onEndEarly={() => handleBallotAction("end")}
			/>

			<Box sx={{ width: "100%" }}>
				<Tabs
					value={activeTab}
					onChange={handleTabChange}
					textColor="primary"
					indicatorColor="primary"
					aria-label="ballot tabs"
					sx={{ borderBottom: 1, borderColor: "divider" }}
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
						<Box
							sx={{
								display: "flex",
								flexDirection: { xs: "column", md: "row" },
								gap: 3,
							}}
						>							<Box sx={{ flex: 1 }}>
								<BallotDetails
									description={ballot.description}
									type={ballot.type}
									category={category}
									endDate={ballot.endDate}
									status={ballot.status}
									timeLeft={ballot.timeLeft}
								/>
							</Box>

							{ballot.type !== 'TEXT_INPUT' && (
								<Box sx={{ flex: 1 }}>
									<VotingOptions options={ballot.options} />
								</Box>
							)}
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
						<BallotAnalytics
							analytics={analytics}
							analyticsLoading={analyticsLoading}
							ballotType={ballot.type}
						/>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default ViewBallotAdmin;
