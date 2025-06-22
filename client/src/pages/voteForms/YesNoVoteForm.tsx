import React from 'react';
import { SingleChoiceVoteForm } from './SingleChoiceVoteForm';

interface YesNoVoteFormProps {
    ballot: {
        id: number;
        title: string;
        description: string;
        options: Array<{
            id: number;
            title: string;
        }>;
    };
    onSubmit?: (vote: { optionId: number }) => Promise<void>;
    readOnly?: boolean;
    selectedOptionId?: number;
}

export const YesNoVoteForm: React.FC<YesNoVoteFormProps> = ({ ballot, onSubmit, readOnly, selectedOptionId }) => {
    // Match options by their titles to map yes/no votes correctly
    const yesOption = ballot.options.find(opt => opt.title.toLowerCase() === 'yes');
    const noOption = ballot.options.find(opt => opt.title.toLowerCase() === 'no');

    if (!yesOption || !noOption) {
        console.error('YesNoVoteForm: Missing required Yes/No options in ballot data', ballot.options);
        return null;
    }

    // Create a ballot object compatible with SingleChoiceVoteForm
    const singleChoiceBallot = {
        ...ballot,
        options: [
            { id: yesOption.id, title: 'Yes' },
            { id: noOption.id, title: 'No' }
        ]
    };

    return (
        <SingleChoiceVoteForm
            ballot={singleChoiceBallot}
            onSubmit={onSubmit}
            readOnly={readOnly}
            selectedOptionId={selectedOptionId}
        />
    );
};
