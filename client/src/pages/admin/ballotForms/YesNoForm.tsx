import React, { useEffect } from 'react';
import { SingleChoiceForm } from './SingleChoiceForm';

export const YesNoForm = () => {
    return (
        <SingleChoiceForm ballotType="YES_NO" />
    );
};
