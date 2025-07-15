import { Conversation, ConversationNode, Connection } from '../types/whiteboard';

export const sampleConversation: Conversation = {
  id: "conv-1",
  title: "Python Data Analysis Project",
  nodes: [
    {
      id: "node-1",
      type: "topic",
      title: "Project Setup Discussion",
      content: "User asked about setting up a data analysis environment. Discussed pandas, jupyter, and project structure.",
      position: { x: 100, y: 100 },
      size: { width: 120, height: 120 },
      connections: ["node-2", "node-3"],
      timestamp: "2024-01-15T10:00:00Z",
      sender: "user"
    },
    {
      id: "node-2",
      type: "code",
      title: "Data Loading Script",
      content: "import pandas as pd\nimport numpy as np\n\ndf = pd.read_csv('sales_data.csv')\nprint(df.head())",
      position: { x: 350, y: 150 },
      size: { width: 250, height: 150 },
      connections: ["node-4"],
      timestamp: "2024-01-15T10:15:00Z",
      sender: "ai"
    },
    {
      id: "node-3",
      type: "action",
      title: "Install Dependencies",
      content: "pip install pandas matplotlib seaborn jupyter",
      position: { x: 150, y: 280 },
      size: { width: 100, height: 100 },
      connections: ["node-2"],
      timestamp: "2024-01-15T10:05:00Z",
      sender: "user"
    },
    {
      id: "node-4",
      type: "message",
      title: "Data Cleaning Discussion",
      content: "User: The data has missing values\\nAI: Let's handle those with df.fillna() or df.dropna()",
      position: { x: 500, y: 200 },
      size: { width: 200, height: 100 },
      connections: ["node-5"],
      timestamp: "2024-01-15T10:30:00Z",
      sender: "user"
    },
    {
      id: "node-5",
      type: "code",
      title: "Cleaning Implementation",
      content: "# Remove rows with missing values\\ndf_clean = df.dropna()\\n\\n# Fill missing values\\ndf_filled = df.fillna(df.mean())",
      position: { x: 650, y: 300 },
      size: { width: 250, height: 150 },
      connections: ["node-6"],
      timestamp: "2024-01-15T10:45:00Z",
      sender: "ai"
    },
    {
      id: "node-6",
      type: "topic",
      title: "Data Visualization",
      content: "Discussion about creating charts and graphs with matplotlib and seaborn",
      position: { x: 400, y: 450 },
      size: { width: 120, height: 120 },
      connections: ["node-7", "node-8"],
      timestamp: "2024-01-15T11:00:00Z",
      sender: "user"
    },
    {
      id: "node-7",
      type: "code",
      title: "Chart Generation",
      content: "import matplotlib.pyplot as plt\\nimport seaborn as sns\\n\\nplt.figure(figsize=(10, 6))\\nsns.barplot(data=df_clean, x='category', y='sales')\\nplt.title('Sales by Category')\\nplt.show()",
      position: { x: 200, y: 600 },
      size: { width: 250, height: 150 },
      connections: [],
      timestamp: "2024-01-15T11:15:00Z",
      sender: "ai"
    },
    {
      id: "node-8",
      type: "action",
      title: "Export Results",
      content: "Save visualizations as PNG files and export cleaned data to CSV",
      position: { x: 600, y: 600 },
      size: { width: 100, height: 100 },
      connections: [],
      timestamp: "2024-01-15T11:30:00Z",
      sender: "user"
    }
  ],
  connections: [
    {
      id: "conn-1",
      from: "node-1",
      to: "node-2",
      points: [
        { x: 220, y: 160 },
        { x: 280, y: 180 },
        { x: 350, y: 200 }
      ]
    },
    {
      id: "conn-2",
      from: "node-1",
      to: "node-3",
      points: [
        { x: 160, y: 220 },
        { x: 150, y: 250 },
        { x: 150, y: 280 }
      ]
    },
    {
      id: "conn-3",
      from: "node-3",
      to: "node-2",
      points: [
        { x: 250, y: 330 },
        { x: 300, y: 300 },
        { x: 350, y: 275 }
      ]
    },
    {
      id: "conn-4",
      from: "node-2",
      to: "node-4",
      points: [
        { x: 475, y: 225 },
        { x: 500, y: 225 }
      ]
    },
    {
      id: "conn-5",
      from: "node-4",
      to: "node-5",
      points: [
        { x: 600, y: 250 },
        { x: 650, y: 275 }
      ]
    },
    {
      id: "conn-6",
      from: "node-5",
      to: "node-6",
      points: [
        { x: 650, y: 375 },
        { x: 550, y: 400 },
        { x: 480, y: 450 }
      ]
    },
    {
      id: "conn-7",
      from: "node-6",
      to: "node-7",
      points: [
        { x: 380, y: 520 },
        { x: 300, y: 550 },
        { x: 275, y: 600 }
      ]
    },
    {
      id: "conn-8",
      from: "node-6",
      to: "node-8",
      points: [
        { x: 520, y: 510 },
        { x: 580, y: 550 },
        { x: 625, y: 600 }
      ]
    }
  ],
  metadata: {
    totalNodes: 8,
    conversationDuration: "90 minutes",
    mainTopics: ["Python", "Data Analysis", "Pandas", "Visualization"]
  }
};

export const additionalConversations: Conversation[] = [
  {
    id: "conv-2",
    title: "Web Development Planning",
    nodes: [
      {
        id: "node-9",
        type: "topic",
        title: "Project Architecture",
        content: "Discussion about React app structure and component organization",
        position: { x: 1000, y: 100 },
        size: { width: 120, height: 120 },
        connections: ["node-10"],
        timestamp: "2024-01-16T09:00:00Z",
        sender: "user"
      },
      {
        id: "node-10",
        type: "code",
        title: "Component Setup",
        content: "import React from 'react'\\nimport { useState } from 'react'\\n\\nconst App = () => {\\n  return <div>Hello World</div>\\n}",
        position: { x: 1200, y: 150 },
        size: { width: 250, height: 150 },
        connections: [],
        timestamp: "2024-01-16T09:15:00Z",
        sender: "ai"
      }
    ],
    connections: [
      {
        id: "conn-9",
        from: "node-9",
        to: "node-10",
        points: [
          { x: 1120, y: 160 },
          { x: 1200, y: 180 }
        ]
      }
    ],
    metadata: {
      totalNodes: 2,
      conversationDuration: "30 minutes",
      mainTopics: ["React", "JavaScript", "Web Development"]
    }
  }
];

export const allConversations = [sampleConversation, ...additionalConversations];