import axios from "axios";
import BASE_URL from "../../config";

// get team token
const getTeamToken = () => {
    return localStorage.getItem("team_token");
};

// get team members in teams service
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
        // console.log("Team members response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Team members fetching error:", error);
        return Promise.reject(error.response?.data || { message: "Fetching team members failed" });
    }
};


// create team member in teams service
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
        //console.log("Create team member response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Create team member error:", error);
        return Promise.reject(error.response?.data || { message: "Creating team member failed" });
    }
};

// update team member in teams service
export const updateTeamsTeamMember = async (teamMemberId, teamMemberData) => {
    // console.log("Updating team member ID:", teamMemberId, "with data:", teamMemberData);
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
        //console.log("Update team member response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Update team member error:", error);
        return Promise.reject(error.response?.data || { message: "Updating team member failed" });
    }
};

// delete team member in teams service
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
        //console.log("Delete team member response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Delete team member error:", error);
        return Promise.reject(error.response?.data || { message: "Deleting team member failed" });
    }
};  
// get roles method "GET" API
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