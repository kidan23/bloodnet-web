import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

// Mock API call
const fetchPosts = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Simulate an error randomly
  // if (Math.random() > 0.7) {
  //   throw new Error('Failed to fetch posts!');
  // }
  return [
    {
      id: 1,
      title: "First Post",
      body: "This is the first post from our mock API.",
    },
    {
      id: 2,
      title: "Second Post",
      body: "Another interesting article for you.",
    },
  ];
};

const HomePage: React.FC = () => {
  const {
    data: posts,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["posts"], 
    queryFn: fetchPosts,
  });

  return (
    <Card title="Home Page - Posts">
      {isLoading && (
        <div className="p-d-flex p-jc-center p-p-4">
          <ProgressSpinner
            style={{ width: "50px", height: "50px" }}
            strokeWidth="8"
            fill="var(--surface-ground)"
            animationDuration=".5s"
          />
        </div>
      )}
      {isError && error && (
        <Message
          severity="error"
          text={error.message || "An error occurred"}
          className="p-mb-3"
        />
      )}
      {posts && (
        <div>
          {posts.map((post) => (
            <Card
              key={post.id}
              title={post.title}
              subTitle={`Post ID: ${post.id}`}
              className="p-mb-3"
            >
              <p>{post.body}</p>
            </Card>
          ))}
        </div>
      )}
      {!isLoading && !isError && !posts?.length && <p>No posts found.</p>}
    </Card>
  );
};

export default HomePage;
