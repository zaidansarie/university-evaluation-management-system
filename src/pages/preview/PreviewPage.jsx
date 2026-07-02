import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Preview.css';
import PreviewToolbar from './components/PreviewToolbar';
import PaperHeader from './components/PaperHeader';
import SectionPreview from './components/SectionPreview';

function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [paper, setPaper] = useState(null);
  const [sections, setSections] = useState([]);
  const [paperQuestions, setPaperQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const paperRes = await fetch(`http://localhost:5000/api/question-papers`);
      const allPapers = await paperRes.json();
      const currentPaper = allPapers.find(p => p.id.toString() === id);
      setPaper(currentPaper);

      if (currentPaper) {
        const savedRes = await fetch(`http://localhost:5000/api/question-papers/${id}/builder-data`);
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setSections(savedData.sections || []);
          setPaperQuestions(savedData.paperQuestions || []);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching preview data:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Loading Preview...</div>;
  }

  if (!paper) {
    return <div style={{padding: '50px', textAlign: 'center'}}>Paper not found.</div>;
  }

  // Group questions by section
  const sectionsWithQuestions = sections.map(sec => {
    // DB sections don't have client_id in the raw API format we fetched, they just have id.
    // The paperQuestions link via section_id.
    const secQs = paperQuestions.filter(pq => pq.section_id === sec.id);
    
    // Group optional questions
    const processedGroups = [];
    let currentGroupId = null;
    let currentGroup = [];

    secQs.forEach(pq => {
      if (pq.optional_group_id) {
        if (currentGroupId === pq.optional_group_id) {
          currentGroup.push(pq);
        } else {
          if (currentGroup.length > 0) processedGroups.push({ type: 'group', questions: currentGroup });
          currentGroupId = pq.optional_group_id;
          currentGroup = [pq];
        }
      } else {
        if (currentGroup.length > 0) {
          processedGroups.push({ type: 'group', questions: currentGroup });
          currentGroupId = null;
          currentGroup = [];
        }
        processedGroups.push({ type: 'single', question: pq });
      }
    });

    if (currentGroup.length > 0) {
      processedGroups.push({ type: 'group', questions: currentGroup });
    }

    let parsedConfig = {};
    try { parsedConfig = typeof sec.config === 'string' ? JSON.parse(sec.config) : sec.config; } catch(e) {}

    return {
      ...sec,
      parsedConfig,
      questionGroups: processedGroups
    };
  });

  return (
    <div className="preview-layout">
      <PreviewToolbar paper={paper} />
      
      <div className="preview-content">
        <div id="pdf-content" className="a4-canvas">
          <PaperHeader paper={paper} />
          
          {sectionsWithQuestions.map(sec => (
            <SectionPreview key={sec.id} section={sec} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PreviewPage;
