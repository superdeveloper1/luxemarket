import React from 'react';

function DraggableImageGrid({ images, onReorder, onRemove, title = "Images" }) {
  const [draggedIndex, setDraggedIndex] = React.useState(null);
  const [dragOverIndex, setDragOverIndex] = React.useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    // Only clear drag over if we're leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove the dragged item
    newImages.splice(draggedIndex, 1);
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newImages.splice(insertIndex, 0, draggedImage);
    
    onReorder(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="icon-camera text-3xl text-gray-400 mx-auto mb-2"></div>
        <p className="text-gray-500">No {title.toLowerCase()} added yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">{title} ({images.length})</p>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <div className="icon-arrows-alt text-xs"></div>
          <span>Drag to reorder</span>
        </div>
      </div>
      
      <div className="grid grid-cols-6 gap-2">
        {images.map((imageUrl, index) => (
          <div
            key={`${imageUrl}-${index}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`relative group cursor-move transition-all duration-200 ${
              draggedIndex === index ? 'scale-105 rotate-2 z-10 dragging' : ''
            } ${
              dragOverIndex === index && draggedIndex !== index 
                ? 'drag-over' 
                : ''
            }`}
          >
            <img
              src={imageUrl}
              alt={`Image ${index + 1}`}
              className="w-full h-20 object-cover rounded border hover:border-[var(--primary-color)] transition-colors"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/80x80?text=Error';
              }}
            />
            
            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              title="Remove image"
            >
              ×
            </button>
            
            {/* Position indicator */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b">
              #{index + 1}
            </div>
            
            {/* Drag handle */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-5 h-5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs flex items-center justify-center shadow-md cursor-move">
                <div className="icon-grip-vertical text-xs"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 mt-2 bg-blue-50 p-2 rounded">
        <strong>Tip:</strong> Drag images to reorder them, or use the arrow buttons. The first image will be the main display image.
      </div>
    </div>
  );
}

export default DraggableImageGrid;