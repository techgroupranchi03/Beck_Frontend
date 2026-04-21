import axios from "axios";
import BASE_URL from "../../config";

const getClientToken = () => {
    return localStorage.getItem("client_token");
};

export const getTeamMembers = async (searchText = "", page = 1) => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/team`,
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

export const createTeamMember = async (teamMemberData) => {
    const token = getClientToken();
    try {
        const response = await axios.post(
            `${BASE_URL}/client/team`,
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

export const updateTeamMember = async (teamMemberId, teamMemberData) => {
    const token = getClientToken();
    try {
        const response = await axios.put(
            `${BASE_URL}/client/team/${teamMemberId}`,
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

export const deleteTeamMember = async (teamMemberId) => {
    const token = getClientToken();
    try {
        const response = await axios.delete(
            `${BASE_URL}/client/team/${teamMemberId}`,
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

export const getRoles = async () => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/team/roles`,
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