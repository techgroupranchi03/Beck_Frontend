import { useState, useEffect, useCallback } from 'react';
import {
    getTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getRoles
} from '../../../service/Clients/Team';
import { useAuth } from '../../../context/AuthContext';
import { getTeamsTeamMembers } from '../../../service/Teams/Team_Task';
import { createTeamsTeamMember, deleteTeamsTeamMember, getTeamsRoles, updateTeamsTeamMember } from '../../../service/Teams/TeamMembers';

export const useTeamData = () => {
    const { user } = useAuth();
    const [teamData, setTeamData] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [teamPagination, setTeamPagination] = useState({});

    // check user role 
    const isTeamUser = user?.role === 'team';

    // Fetch team members
    const fetchTeamMembers = useCallback(async (searchText = "", page = 1, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            }
            // const res = await getTeamMembers(searchText , page);
            const res = isTeamUser
                ? await getTeamsTeamMembers(searchText, page)
                : await getTeamMembers(searchText, page);
            if (append) {
                setTeamData((prev) => [...prev, ...(res.data || [])]);
            } else {
                setTeamData(res.data || []);
            }
            setTeamPagination({
                hasNextPage: res.hasNextPage || false,
                hasPreviousPage: res.hasPreviousPage || false,
                page: res.page || 1,
                total: res.total || 0,
                totalPages: res.totalPages || 1,
            })

            console.log("Fetched Team Members:", res);

            return res.data;
        } catch (err) {
            console.error('Error fetching team members:', err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch roles
    const fetchRoles = useCallback(async () => {
        try {
            // const res = await getRoles();
            const res = isTeamUser
                ? await getTeamsRoles()
                : await getRoles();
            setRoles(res.data || []);
            console.log("Fetched Roles:", res);
            return res.data;
        } catch (err) {
            console.error('Error fetching roles:', err);
            setError(err);
            throw err;
        }
    }, []);

    // Fetch all data in parallel
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                fetchTeamMembers(),
                fetchRoles()
            ]);
        } catch (err) {
            console.error('Error fetching all data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchTeamMembers, fetchRoles]);

    // Initial data fetch
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // ==================== TEAM OPERATIONS ====================

    // Create new team member
    const createTeam = async (values) => {
        try {
            //const res = await createTeamMember(values);
            const res = isTeamUser
                ? await createTeamsTeamMember(values)
                : await createTeamMember(values);
            if (res.data) {
                setTeamData((prev) => [res.data, ...prev]);
            }
            return res;
        } catch (err) {
            console.error('Error creating team member:', err);
            throw err;
        }
    };

    // Update existing team member
    const updateTeam = async (id, values) => {
        try {
            // const res = await updateTeamMember(id, values);
            const res = isTeamUser
                ? await updateTeamsTeamMember(id, values)
                : await updateTeamMember(id, values);
            if (res.data) {
                setTeamData((prev) =>
                    prev.map((member) => (member.id === id ? res.data : member))
                );
            }
            return res;
        } catch (err) {
            console.error('Error updating team member:', err);
            throw err;
        }
    };

    // Delete team member
    const deleteTeam = async (id) => {
        try {
            //const res = await deleteTeamMember(id);
            const res = isTeamUser
                ? await deleteTeamsTeamMember(id)
                : await deleteTeamMember(id);
            setTeamData((prev) => prev.filter((member) => member.id !== id));
            return res;
        } catch (err) {
            console.error('Error deleting team member:', err);
            throw err;
        }
    };

    // Refresh team data
    const refreshTeamData = async () => {
        try {
            await fetchTeamMembers();
        } catch (err) {
            console.error('Error refreshing team data:', err);
        }
    };

    return {
        // Data States
        teamData,
        roles,
        loading,
        error,

        // Pagination Data
        teamPagination,

        // Team Operations
        createTeam,
        updateTeam,
        deleteTeam,
        refreshTeamData,

        // fetch team
        fetchTeamMembers,

        // General Operations
        refetchAll: fetchAllData,
    };
};
