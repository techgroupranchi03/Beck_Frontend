import axios from "axios";
import BASE_URL from "../../config";

const getTeamToken = () => {
    return localStorage.getItem("team_token");
};

export const getTeamsTeamMembers = async (searchText = "", page = 1) => {
    const token = getTeamToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/members`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: searchText,
                    page: page
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Team members fetching error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching team members failed" });
    }
};

export const createTeamsTeamMember = async (teamMemberData) => {
    const token = getTeamToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/team/members`,
            teamMemberData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Create team member error:", error);
        return Promise.reject(error.response?.data || { message: "Creating team member failed" });
    }
};

export const updateTeamsTeamMember = async (teamMemberId, teamMemberData) => {
    const token = getTeamToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/team/members/${teamMemberId}`,
            teamMemberData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Update team member error:", error);
        return Promise.reject(error.response?.data || { message: "Updating team member failed" });
    }
};

export const deleteTeamsTeamMember = async (teamMemberId) => {
    const token = getTeamToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/team/members/${teamMemberId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Delete team member error:", error);
        return Promise.reject(error.response?.data || { message: "Deleting team member failed" });
    }
};  

export const getTeamsRoles = async () => {
    const token = getTeamToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/team/roles`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Roles fetching error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching roles failed" });
    }
};  