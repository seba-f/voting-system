import UserRoles from '../../models/entities/intermediary/userRolesModel';
import Role from '../../models/entities/user/roleModel';

export interface UserRoleWithRole extends UserRoles {
    Role?: {
        id: number;
        name: string;
    };
}

// Helper function to format ballot response
export const formatBallotResponse = (ballot: any) => {
    const json = ballot.toJSON();
    const currentDate = new Date();
    const endDate = new Date(ballot.limitDate);

    let status;
    if (ballot.isSuspended) {
        status = 'Suspended';
    } else if (endDate < currentDate) {
        status = 'Ended';
    } else {
        status = 'Active';
    }

    return {
        ...json,
        type: json.ballotType, // Map ballotType to type for client compatibility
        endDate: ballot.limitDate.toISOString(),  // Format dates as ISO strings
        startDate: ballot.createdAt?.toISOString() || new Date().toISOString(),
        status // Add calculated status
    };
};
