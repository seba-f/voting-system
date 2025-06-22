export interface Option {
    id: number;
    title: string;
    isText?: boolean;
}

export interface Ballot {
    id: number;
    title: string;
    description: string;
    type: BallotType;
    endDate: string;
    status: string;
    options: Option[];
}

export enum BallotType {
    SINGLE_CHOICE = 'SINGLE_CHOICE',     // One option only
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE', // Multiple options allowed
    RANKED_CHOICE = 'RANKED_CHOICE',     // Rank options by preference
    LINEAR_CHOICE = 'LINEAR_CHOICE',     // Linear scale response
    TEXT_INPUT = 'TEXT_INPUT',           // Free text response
    YES_NO = 'YES_NO'                    // Simple yes/no vote 
}
