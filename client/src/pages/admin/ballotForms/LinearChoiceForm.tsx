import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useTheme,
    Grid,
    Divider,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
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
    scaleStart: number;
    scaleEnd: number;
    leftLabel: string;
    rightLabel: string;
}

export const LinearChoiceForm = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        categoryId: 0,
        limitDate: new Date(),
        scaleStart: -5,
        scaleEnd: 5,
        leftLabel: "",
        rightLabel: "",
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const response = await API.get("/categories");
                setCategories(response.data.categories || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (categoryId: number) => {
        setFormData((prev) => ({ ...prev, categoryId }));
        const category = categories.find((c) => c.id === categoryId);
        setSelectedCategory(category || null);
    };

    const generateOptionsArray = () => {
        const options = [];
        const { scaleStart, scaleEnd, leftLabel, rightLabel } = formData;
        const steps = Math.abs(scaleEnd - scaleStart) + 1;
        
        for (let i = 0; i < steps; i++) {
            const value = scaleStart + i;
            let title = value.toString();
            
            // Add labels for the ends
            if (value === scaleStart && leftLabel) {
                title = `${value},${leftLabel}`;
            } else if (value === scaleEnd && rightLabel) {
                title = `${value},${rightLabel}`;
            }
            
            options.push({ title });
        }
        return options;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setFormError("Title is required");
            return;
        }
        if (!formData.description.trim()) {
            setFormError("Description is required");
            return;
        }
        if (!formData.categoryId) {
            setFormError("Category is required");
            return;
        }
        if (!formData.leftLabel.trim()) {
            setFormError("Left end label is required");
            return;
        }
        if (!formData.rightLabel.trim()) {
            setFormError("Right end label is required");
            return;
        }
        if (formData.scaleStart >= formData.scaleEnd) {
            setFormError("Scale start must be less than scale end");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await API.post("/ballots", {
                ...formData,
                ballotType: "LINEAR_CHOICE",
                options: generateOptionsArray(),
            });
            navigate("/admin/ballots");
        } catch (error) {
            console.error("Error creating ballot:", error);
            setFormError("Failed to create ballot. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <Typography>Loading...</Typography>;
    }

    return (        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Paper elevation={0} sx={{ p: 2.5, mt: 2, bgcolor:"background.default" }}>
                <Stack spacing={2.5}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                title: e.target.value,
                            }))
                        }
                        error={!!formError && !formData.title.trim()}
                        helperText={
                            formError && !formData.title.trim()
                                ? "Title is required"
                                : ""
                        }
                    />                    <TextField
                        size="small"
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                description: e.target.value,
                            }))
                        }
                        error={!!formError && !formData.description.trim()}
                        helperText={
                            formError && !formData.description.trim()
                                ? "Description is required"
                                : ""
                        }
                    />                    <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formData.categoryId || ""}
                            label="Category"
                            onChange={(e) =>
                                handleCategoryChange(Number(e.target.value))
                            }
                            error={!!formError && !formData.categoryId}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                        <TextField
                            size="small"
                            type="number"
                            label="Scale Start"
                            value={formData.scaleStart}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    scaleStart: Number(e.target.value),
                                }))
                            }
                            inputProps={{ step: 1 }}
                        />
                        <TextField                            size="small"
                            type="number"
                            label="Scale End"
                            value={formData.scaleEnd}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    scaleEnd: Number(e.target.value),
                                }))
                            }
                            inputProps={{ step: 1 }}
                        />
                        <TextField                            size="small"
                            label="Left End Label"
                            value={formData.leftLabel}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    leftLabel: e.target.value,
                                }))
                            }
                            error={!!formError && !formData.leftLabel.trim()}
                            helperText={
                                formError && !formData.leftLabel.trim()
                                    ? "Left end label is required"
                                    : ""
                            }
                        />
                        <TextField                            size="small"
                            label="Right End Label"
                            value={formData.rightLabel}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    rightLabel: e.target.value,
                                }))
                            }
                            error={!!formError && !formData.rightLabel.trim()}
                            helperText={
                                formError && !formData.rightLabel.trim()
                                    ? "Right end label is required"
                                    : ""
                            }
                        />
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterDateFns}>                        <DateTimePicker
                            slotProps={{ textField: { size: 'small' } }}
                            label="Expiration Date"
                            value={formData.limitDate}
                            onChange={(date) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    limitDate: date || new Date(),
                                }))
                            }
                        />
                    </LocalizationProvider>

                    {formError && (
                        <Typography color="error" variant="body2">
                            {formError}
                        </Typography>
                    )}
                    
                    <Divider />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Create Ballot"}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
};
