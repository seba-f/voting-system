import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    useTheme
} from '@mui/material';
import { BallotType } from '../types/ballot';

interface FilterControlsProps {
    selectedType: string;
    selectedCategory: number | null;
    onTypeChange: (type: string) => void;
    onCategoryChange: (categoryId: number | null) => void;
    categories: { id: number; name: string }[];
    showAll?: boolean;
    direction?: 'row' | 'column';
}

export const FilterControls: React.FC<FilterControlsProps> = ({
    selectedType,
    selectedCategory,
    onTypeChange,
    onCategoryChange,
    categories,
    showAll = true,
    direction = 'row'
}) => {
    const theme = useTheme();

    const handleTypeChange = (event: SelectChangeEvent) => {
        onTypeChange(event.target.value);
    };

    const handleCategoryChange = (event: SelectChangeEvent) => {
        onCategoryChange(event.target.value === 'all' ? null : Number(event.target.value));
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                gap: 2, 
                flexDirection: direction,
                '& .MuiFormControl-root': {
                    minWidth: 150
                }
            }}
        >
            <FormControl size="small">
                <InputLabel>Type</InputLabel>
                <Select
                    value={selectedType}
                    label="Type"
                    onChange={handleTypeChange}
                >
                    {showAll && <MenuItem value="all">All Types</MenuItem>}
                    {Object.values(BallotType).map((type) => (
                        <MenuItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small">
                <InputLabel>Category</InputLabel>
                <Select
                    value={selectedCategory?.toString() || 'all'}
                    label="Category"
                    onChange={handleCategoryChange}
                >
                    {showAll && <MenuItem value="all">All Categories</MenuItem>}
                    {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id.toString()}>
                            {category.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};
