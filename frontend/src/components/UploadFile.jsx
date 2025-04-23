import {React,useState }from "react";

function UploadFile() {
  const [file, setFile] = useState(null);
  const [shareableLink, setShareableLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); 
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3333/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setShareableLink(data.data.fileUrl);
      } 
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong!');
    }
    setLoading(false);
  };

  return (
    <div className="uploadFile--container">
     
      <div className="uploadfile--link">
        <input type="file" onChange={handleChange} />
        <button onClick={handleUpload} className="uploadFile--button">
          Generate
          
        </button>
      </div>
      {loading && (
        <div className="loading-spinner">
          <span>Loading...</span>
        </div>
      )}
      {shareableLink && (
        <div>
          <p>Shareable Link:</p>
          <a href={shareableLink} target="_blank" rel="noopener noreferrer">
            {shareableLink}
          </a>
        </div>
      )}
    </div>
  );
}

export default UploadFile;
