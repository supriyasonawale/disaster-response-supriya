// frontend/src/components/SocialMediaPosts.jsx
import React, { useEffect, useState } from 'react';

const SocialMediaPosts = ({ disasterId }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchSocial = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/disasters/${disasterId}/social-media`);
        const data = await res.json();
        setPosts(data.data || []);
      } catch (err) {
        console.error('Error fetching social posts:', err);
      }
    };
    fetchSocial();
  }, [disasterId]);

  if (posts.length === 0) return null;

  return (
    <div className="mt-2">
      <h6>💬 Social Reports:</h6>
      <ul className="list-unstyled">
        {posts.map((p, i) => (
          <li key={i}>
            <strong>@{p.user}</strong>: {p.post}
            <br />
            <small className="text-muted">{new Date(p.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SocialMediaPosts;
