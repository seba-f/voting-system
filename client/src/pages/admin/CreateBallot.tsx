import React, { useState } from 'react';
import {
    Container,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
} from '@mui/material';
import { PageHeader } from '../../components/PageHeader';

// Import placeholder form components
import { SingleChoiceForm } from './ballotForms/SingleChoiceForm';
import { MultipleChoiceForm } from './ballotForms/MultipleChoiceForm';
import { RankedChoiceForm } from './ballotForms/RankedChoiceForm';
import { LinearChoiceForm } from './ballotForms/LinearChoiceForm';
import { TextInputForm } from './ballotForms/TextInputForm';
import { YesNoForm } from './ballotForms/YesNoForm';

export enum BallotType {
    SINGLE_CHOICE = 'SINGLE_CHOICE',
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    RANKED_CHOICE = 'RANKED_CHOICE',
    LINEAR_CHOICE = 'LINEAR_CHOICE',
    TEXT_INPUT = 'TEXT_INPUT',
    YES_NO = 'YES_NO'
}

const ballotTypeLabels = {
    [BallotType.SINGLE_CHOICE]: 'Single Choice',
    [BallotType.MULTIPLE_CHOICE]: 'Multiple Choice',
    [BallotType.RANKED_CHOICE]: 'Ranked Choice',
    [BallotType.LINEAR_CHOICE]: 'Linear Scale',
    [BallotType.TEXT_INPUT]: 'Text Input',
    [BallotType.YES_NO]: 'Yes/No'
};

export const CreateBallot = () => {
    const [selectedType, setSelectedType] = useState<BallotType | ''>('');

    const handleTypeChange = (event: any) => {
        setSelectedType(event.target.value as BallotType);
    };

    const renderForm = () => {
        switch (selectedType) {            case BallotType.SINGLE_CHOICE:
                return <SingleChoiceForm ballotType={selectedType} />;
            case BallotType.MULTIPLE_CHOICE:
                return <MultipleChoiceForm />;
            case BallotType.RANKED_CHOICE:
                return <RankedChoiceForm />;
            case BallotType.LINEAR_CHOICE:
                return <LinearChoiceForm />;
            case BallotType.TEXT_INPUT:
                return <TextInputForm />;
            case BallotType.YES_NO:
                return <YesNoForm />;
            default:
                return (
                    <Typography variant="body1" sx={{ mt: 4, textAlign: 'center' }}>
                        Please select a ballot type to continue
                    </Typography>
                );
        }
    };

    return (
        <Box sx={{p:3}}>
            <PageHeader title="Create New Ballot" />
            
            <Box>
                {/* Ballot Type Selector */}
                <Box sx={{ mt: 4, maxWidth: 400, mx: 'auto'}}>
                    <FormControl fullWidth>
                        <InputLabel id="ballot-type-label">Ballot Type</InputLabel>
                        <Select
                            labelId="ballot-type-label"
                            id="ballot-type-select"
                            value={selectedType}
                            label="Ballot Type"
                            onChange={handleTypeChange}
                        >
                            {Object.entries(ballotTypeLabels).map(([type, label]) => (
                                <MenuItem key={type} value={type}>
                                    {label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Form Container */}
                <Box sx={{ width: '100%' }}>
                    {renderForm()}
                </Box>
            </Box>
        </Box>
    );
};
