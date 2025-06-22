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
}

export const TextInputForm = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        categoryId: 0,
        limitDate: new Date(),
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

        try {
            setIsSubmitting(true);
            const response = await API.post("/ballots", {
                ...formData,
                ballotType: "TEXT_INPUT",
                options: [{ title: "Text Response", isText: true }],
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

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Paper                elevation={2}
                sx={{
                    p: 3,
                    mt: 2,
                    maxHeight: "calc(100vh - 200px)",
                    ...scrollbarStyle,
                }}
            >
                <Stack spacing={3}>
                    <TextField
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
                        error={!!formError && !formData.description.trim()}
                        helperText={
                            formError && !formData.description.trim()
                                ? "Description is required"
                                : ""
                        }
                    />

                    <FormControl fullWidth>
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
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
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
