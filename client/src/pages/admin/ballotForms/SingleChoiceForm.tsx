import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Typography,
	TextField,
	Button,
	IconButton,
	Paper,
	Stack,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
    useTheme,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "../../../api/axios";
import { MockChip } from "../../../components/MockChip";
import API from "../../../api/axios";
import { scrollbarStyle } from "../../../styles/scrollbar";

interface Category {
	id: number;
	name: string;
	roles: { id: number; name: string }[];
}

interface FormData {
	title: string;
	description: string;
	categoryId: number;
	limitDate: Date;
	options: string[];
}

interface Props {
    ballotType: string;
}

export const SingleChoiceForm: React.FC<Props> = ({ ballotType }) => {
    const navigate = useNavigate();
	const [formData, setFormData] = useState<FormData>({
		title: "",
		description: "",
		categoryId: 0,
		limitDate: new Date(),
		options: [""],
	});
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
    
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				setIsLoading(true);
				const response = await API.get("/categories");
				setCategories(response.data.categories || []);

				// For YES_NO ballots, initialize with predefined options
				if (ballotType === "YES_NO") {
					setFormData(prev => ({
						...prev,
						options: ["Yes", "No"]
					}));
				}
			} catch (error) {
				console.error("Error fetching categories:", error);
				setCategories([]);
			} finally {
				setIsLoading(false);
			}
		};
		fetchCategories();
	}, [ballotType]);

	const handleCategoryChange = (categoryId: number) => {
		setFormData((prev) => ({ ...prev, categoryId }));
		const category = categories.find((c) => c.id === categoryId);
		setSelectedCategory(category || null);
	};

	const handleOptionChange = (index: number, value: string) => {
		const newOptions = [...formData.options];
		newOptions[index] = value;
		setFormData((prev) => ({ ...prev, options: newOptions }));
	};

	const addOption = () => {
		setFormData((prev) => ({
			...prev,
			options: [...prev.options, ""],
		}));
	};

	const removeOption = (index: number) => {
		if (formData.options.length > 1) {
			const newOptions = formData.options.filter((_, i) => i !== index);
			setFormData((prev) => ({ ...prev, options: newOptions }));
		}
	};
	const handleSubmit = async () => {
        // Validate required fields
        if (!formData.title || !formData.categoryId || formData.options.some(opt => !opt.trim())) {
            setFormError("Please fill in all required fields");
            return;
        }

        // Validate date is not in the past
        const now = new Date();
        if (formData.limitDate < now) {
            setFormError("Expiry date cannot be in the past");
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                categoryId: formData.categoryId,
                limitDate: formData.limitDate,
                votingOptions: formData.options.map(text => ({
                    text,
                    isText: false
                })),
                ballotType: ballotType
            };

            await API.post('/ballots', payload);
            navigate('/admin/ballots');
        } catch (error: any) {
            console.error('Error creating ballot:', error);
            setFormError(error.response?.data?.message || "Failed to create ballot");
        } finally {
            setIsSubmitting(false);
        }
    };

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				overflow: 'hidden',
			}}
		>
			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					p: "20px",
					gap: 2,
					overflow: 'hidden',
					minHeight: 0, // Ensure flex child doesn't exceed parent height
				}}
			>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "3fr 2fr",
						gap: 4,
						width: "100%",
						overflow: 'hidden',
						flex: 1,
						minHeight: 0, // Ensure grid doesn't exceed flex parent
						height:"100vh"
					}}
				>
					{/* Left Column */}
					<Stack spacing={2} sx={{ ...scrollbarStyle, overflow: 'auto', minHeight: 0, pt:2 }}>
						<TextField
							fullWidth
							label="Title"
							value={formData.title}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, title: e.target.value }))
							}
						/>

						<TextField
							fullWidth
							label="Description"
							multiline
							rows={4}
							value={formData.description}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
						/>

						<FormControl fullWidth>
							<InputLabel>Category</InputLabel>
							<Select
								value={formData.categoryId || ""}
								label="Category"
								onChange={(e) => handleCategoryChange(e.target.value as number)}
							>
								{isLoading ? (
									<MenuItem disabled>Loading categories...</MenuItem>
								) : categories.length === 0 ? (
									<MenuItem disabled>No categories available</MenuItem>
								) : (
									categories.map((category) => (
										<MenuItem key={category.id} value={category.id}>
											{category.name}
										</MenuItem>
									))
								)}
							</Select>
							{selectedCategory && (
								<Box
									sx={{
										mt: 0.5,
										display: "flex",
										alignItems: "center",
										gap: 0.5,
										color: "text.secondary",
										fontSize: "0.75rem",
									}}
								>
									<InfoIcon sx={{ fontSize: "0.875rem" }} />
									<span>Accessible by:</span>
									{selectedCategory.roles.map((role, idx) => (
										<React.Fragment key={role.id}>
											<span>{role.name}</span>
											{idx < selectedCategory.roles.length - 1 && (
												<span>•</span>
											)}
										</React.Fragment>
									))}
								</Box>
							)}
						</FormControl>

						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<DateTimePicker
								label="Expiry Date"
								value={formData.limitDate}
								onChange={(newValue) => {
									if (newValue) {
										setFormData((prev) => ({ ...prev, limitDate: newValue }));
									}
								}}
							/>
						</LocalizationProvider>
					</Stack>

					{/* Right Column */}
					<Paper
						elevation={0}
						sx={{
							bgcolor: "background.default",
							alignSelf: "start",
							width: "100%",
							display: 'flex',
							flexDirection: 'column',
							height: '25rem', // Slightly reduced to ensure it fits
						}}
					>
						<Box sx={{ 
							px: 2, 
							py: 1,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							borderBottom: 1,
							borderColor: 'divider'
						}}>							<Typography variant="h6">
								Options
							</Typography>
							{ballotType !== "YES_NO" && (
								<Button
									size="small"
									startIcon={<AddIcon />}
									onClick={addOption}
								>
									Add Option
								</Button>
							)}
						</Box>
						<Box
							sx={{
								...scrollbarStyle,
								flex: 1,
								overflowY: 'auto',
								px: 2,
								py: 1.5,
							}}
						>
							<Stack spacing={1.5}>
								{formData.options.map((option, index) => (
									<Box key={index} sx={{ display: "flex", gap: 1 }}>
										<TextField
											size="small"
											fullWidth
											label={`Option ${index + 1}`}
											value={option}
											onChange={(e) => handleOptionChange(index, e.target.value)}
											disabled={ballotType === "YES_NO"}
										/>
										{ballotType !== "YES_NO" && formData.options.length > 1 && (
											<IconButton
												size="small"
												onClick={() => removeOption(index)}
												disabled={formData.options.length === 1}
												sx={{ flexShrink: 0 }}
											>
												<DeleteIcon />
											</IconButton>
										)}
									</Box>
								))}
							</Stack>
						</Box>
					</Paper>
				</Box>
			</Box>

			{/* Submit Button */}
			<Box
				sx={{
					borderTop: 1,
					borderColor: "divider",
					px: 2,
					py: 1.5,
					display: "flex",
					justifyContent: "flex-end",
					gap: 2,
					bgcolor: "background.default",
				}}
			>
				<Button
					variant="contained"
					disabled={isSubmitting}
					onClick={handleSubmit}
				>
					Create Ballot
				</Button>
			</Box>
			{formError && (
				<Typography color="error" sx={{ px: 2, pb: 1 }}>
					{formError}
				</Typography>
			)}
		</Box>
	);
};
