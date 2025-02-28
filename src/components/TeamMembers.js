import { useEffect, useState } from 'react';
import axios from 'axios';

const TeamMembers = ({ repoId }) => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
        try {
            const res = await axios.get(`/api/repos/${repoId}/members`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Add authorization header
              },
            });
            setMembers(res.data);
          } catch (error) {
            console.error('Failed to fetch members:', error);
          }
    };
    fetchMembers();
  }, [repoId]);

  return (
    <div className="team-members">
      <h3>Team Chat</h3>
      <ul>
        {members.map(member => (
          <li key={member._id}>
            <span>{member.username}</span>
            <span className="role-badge">{member.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default TeamMembers;