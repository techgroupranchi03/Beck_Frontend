import axios from "axios";
import BASE_URL from "../../config";

// get client token 
const getClientToken = () => {
    return localStorage.getItem("client_token");
};

// get team members 
export const getTeamMembers = async (searchText) => {
    const token = getClientToken();
    try {
        const response = await axios.get(
            `${BASE_URL}/client/team`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    search: searchText
                }
            }
        );
        // console.log("Team members response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Team members fetching error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching team members failed" });
    }
};

// create team member
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
        //console.log("Create team member response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Create team member error:", error);
        return Promise.reject(error.response?.data || { message: "Creating team member failed" });
    }
};

// update team member
export const updateTeamMember = async (teamMemberId, teamMemberData) => {
    // console.log("Updating team member ID:", teamMemberId, "with data:", teamMemberData);
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
        //console.log("Update team member response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Update team member error:", error);
        return Promise.reject(error.response?.data || { message: "Updating team member failed" });
    }
};

// delete team member
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
        //console.log("Delete team member response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Delete team member error:", error);
        return Promise.reject(error.response?.data || { message: "Deleting team member failed" });
    }
};

// get role
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
        // console.log("Roles response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Roles fetching error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching roles failed" });
    }
};