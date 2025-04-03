import React, { useEffect, useState } from 'react';
import Tree from 'react-d3-tree';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import SwitchList from '../../components/SwitchLists'; // Adjust the import path as necessary
import './custom-tree.css';
import config from '../../config';
const theme = createTheme();

const truncateText = (text, maxLength = 20) => (
  text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
);

const transformData = (data) => {
  if (!Array.isArray(data)) return data;
  return data.map(node => {
    const isIndexed = node.status === 'true';
    let nodeTypeClass = '';
    if (node.children && node.children.length > 0) {
      nodeTypeClass = 'node__branch';
    } else {
      nodeTypeClass = 'node__leaf';
    }
    if (node.parent === null) {
      nodeTypeClass = 'node__root';
    }
    return {
      ...node,
      name: truncateText(node.name),
      attributes: {
        indexed: truncateText(node.status || ''),
      },
      nodeTypeClass,
      indexedClass: isIndexed ? 'node__indexed' : 'node__not-indexed',
      children: transformData(node.children),
    };
  });
};

const renderCustomNode = ({ nodeDatum, toggleNode, hierarchyPointNode }) => {
  const combinedClassName = `${nodeDatum.nodeTypeClass} ${nodeDatum.indexedClass}`;
  return (
    <g className={combinedClassName}>
      <circle r={15} onClick={toggleNode} />
      <text fill="black" x="20">
        {nodeDatum.name}
      </text>
    </g>
  );
};

const LLDPNeighborsView = () => {
  const [data, setData] = useState(null);
  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchData = async (switchName) => {
    setLoading(true);
    try {
      const dbUrl = config.DATABASE_API_URL;
      console.log(config.DATABASE_API_URL);
      
      const response = await fetch(`${dbUrl}/generate_network_tree/${switchName}`);
      const result = await response.json();
      setData(transformData(result));
    } catch (error) {
      console.error('Error fetching', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSwitch = (selectedSwitch) => {
    setSelectedSwitch(selectedSwitch);
    if (selectedSwitch) {
      fetchData(selectedSwitch.hostname);
    }
  };

  const handleRefresh = () => {
    if (selectedSwitch) {
      fetchData(selectedSwitch.hostname);
    }
  };

  const handleUpdate = () => {
    // Placeholder for update functionality
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', height: '100vh', padding: 2 }}>
        <SwitchList
          selectedSwitch={selectedSwitch}
          onSelectSwitch={handleSelectSwitch}
          onRefresh={handleRefresh}
          onUpdate={handleUpdate}
          setStatusMessage={setStatusMessage}
        />
        {loading ? (
          <CircularProgress />
        ) : (
          data && (
            <div id="treeWrapper" style={{ width: '100%', height: '100%' }}>
              <Tree
                data={data}
                orientation="vertical"
                separation={{ siblings: 1.5, nonSiblings: 2 }}
                translate={{ x: 200, y: 100 }}
                nodeSize={{ x: 200, y: 200 }}
                pathFunc="step"
                renderCustomNodeElement={renderCustomNode}
              />
            </div>
          )
        )}
        {statusMessage && (
          <Typography variant="body1" color="error" mt={2}>
            {statusMessage}
          </Typography>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default LLDPNeighborsView;