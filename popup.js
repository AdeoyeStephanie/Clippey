//testing to see if the popup.js is working
/*console.log("popup.js is connected!");

document.addEventListener("DOMContentLoaded", () => {
alert("Clippey is working!");
}); */

// Wait for the page to fully load before running code
document.addEventListener('DOMContentLoaded', function() {

    //Getting references to all the HTML elements
    const saveButton = document.querySelector('.save-text');
    const viewButton = document.querySelector('.view-saved');
    const textArea = document.getElementById('clipText');

    //  Set up what happens when "Save Text" is clicked
    saveButton.addEventListener('click', function() {
        // Get text in the textarea
        const textToSave = textArea.value;
        
        // Check if there's actually text so we don't save a blank page
        if (textToSave.trim() === '') {
            alert('Please enter text before saving :)');
            return; // 
        }
        
        // Getting existing saved clips from Chrome storage
        // chrome.storage.sync works across devices if user is signed in
        chrome.storage.local.get(['clips'], function(result) {
            // If there are no saved clips yet, start with an empty array
            let clips = result.clips || [];
            
            // Add the new clip to the beginning of the array
            // Also include date and time stamp
            clips.unshift({
                text: textToSave,
                timestamp: new Date().toLocaleString()
            });
            
            // Keep only the last 20 clips 
            if (clips.length > 20) {
                clips = clips.slice(0, 20);
            }
            
            // Saving the updated clips array back to storage
            chrome.storage.local.set({ clips: clips }, function() {
                alert('Text saved! 📋');
                textArea.value = ''; //clear text box
            });
        });
    });

    // User views saved text
    viewButton.addEventListener('click', function() {
        // Get all saved clips from storage
        chrome.storage.local.get(['clips'], function(result) {
            const clips = result.clips || [];
            
            // If no clips saved yet
            if (clips.length === 0) {
                alert('No saved clips yet! Save some text first.');
                return;
            }
            
            // Displaying saved clips
            // replace the current view with the clips list
            const whiteContainer = document.querySelector('.white-container');
            
            // Build HTML for the clips view
            let clipsHTML = `
                <div style="padding: 20px; width: 100%; overflow-y: auto;">
                    <h2 style="font-family: 'Chilanka', cursive; text-align: center;">Your Saved Clips</h2>
                    <button id="backButton" style="margin-bottom: 15px; padding: 8px 15px; font-family: 'Chilanka', cursive; background-color: rgb(255, 247, 247); border-radius: 10px; border: 1px solid #ccc; cursor: pointer;">← Back</button>
                    <button id="clearAll" style="margin-bottom: 15px; margin-left: 10px; padding: 8px 15px; font-family: 'Chilanka', cursive; background-color: #ffcccb; border-radius: 10px; border: 1px solid #ccc; cursor: pointer;">Clear All</button>
                    <div id="clipsList">
            `;
            
            // Loop through each clip and create a box for it
            clips.forEach(function(clip, index) {
                clipsHTML += `
                    <div class="clip-item" data-index="${index}" style="
                        background-color: rgb(250, 236, 236);
                        padding: 12px;
                        margin-bottom: 10px;
                        border-radius: 8px;
                        border: 1px solid #ddd;
                        cursor: pointer;
                        font-family: 'Chilanka', cursive;
                    ">
                        <div style="font-size: 0.75em; color: #666; margin-bottom: 5px;">${clip.timestamp}</div>
                        <div style="word-wrap: break-word;">${clip.text.substring(0, 100)}${clip.text.length > 100 ? '...' : ''}</div>
                    </div>
                `;
            });
            
            clipsHTML += '</div></div>';
            
            // Replace the current content with clips view
            whiteContainer.innerHTML = clipsHTML;
            
            // click handlers for the clips
            const clipItems = document.querySelectorAll('.clip-item');
            clipItems.forEach(function(item) {
                item.addEventListener('click', function() {
                    const index = this.getAttribute('data-index');
                    const clipText = clips[index].text;
                    
                    // Copy to clipboard using the Clipboard API
                    navigator.clipboard.writeText(clipText).then(function() {
                        alert('Copied to clipboard! ✨');
                    });
                });
            });
            
            // Back button to return to main view
            document.getElementById('backButton').addEventListener('click', function() {
                // Reload the popup to go back to main view
                location.reload();
            });
            
            // STEP 9: Clear all clips button
            document.getElementById('clearAll').addEventListener('click', function() {
                if (confirm('Are you sure you want to delete all saved clips?')) {
                    chrome.storage.local.set({ clips: [] }, function() {
                        location.reload();
                    });
                }
            });
        });
    });
});