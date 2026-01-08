// load page content before running
document.addEventListener('DOMContentLoaded', function() {

    //Getting references to all the HTML elements
    const saveButton = document.querySelector('.save-text');
    const viewButton = document.querySelector('.view-saved');
    const textArea = document.getElementById('clipText');
    const notification = document.getElementById('notification')

    // Show Notifications in popup
    function showNotification(message, duration = 2000) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }

    //  Set up what happens when "Save Text" is clicked
    saveButton.addEventListener('click', () => {
            // Get text in the textarea
            const textToSave = textArea.value;

            // Check if there's actually text to avoid saving blank text
            if (textToSave.trim() === '') {
                showNotification('Please enter text first :)');
                return;
            }

            // Getting existing saved clips from Chrome storage
            // chrome.storage.local for more storage
            chrome.storage.local.get(['clips'], function (result) {
                // If there are no saved clips yet, start with an empty array
                let clips = result.clips || [];

                // Add the new clip to the beginning of the array
                // Also include date and time stamp
                clips.unshift({
                    text: textToSave,
                    timestamp: new Date().toLocaleString()
                });

                // Manage total number of clips
                if (clips.length > 100) {
                    clips = clips.slice(0, 100);
                    alert(" Storage is full. Please delete some old clips")
                }

                // Saving the updated clips array back to storage
                chrome.storage.local.set({ clips: clips }, function () {
                    showNotification('Text saved! 📋');
                    textArea.value = ''; //clear text box
                });
            });
        });

    // Viewing saved text
    viewButton.addEventListener('click', function() {
        // Get all saved clips from storage
        chrome.storage.local.get(['clips'], function(result) {
            const clips = result.clips || [];
            
            // If no clips saved yet
            if (clips.length === 0) {
                showNotification('No saved clips yet! Save some text first.', 3000);
                return;
            }
            
            // Displaying saved clips
            // replace the current view with the clips list
            const whiteContainer = document.querySelector('.white-container');
            
            // Build HTML for the clips view
            let clipsHTML = `
                <div style="padding: 20px; width: 100%; overflow-y: auto;">
                    <h2 style="font-family: 'Montserrat; text-align: center;">Your Saved Clips</h2>
                    <button id="backButton" style="margin-bottom: 15px; padding: 8px 15px; font-family: 'Montserrat'; background-color: rgb(255, 247, 247); border-radius: 10px; border: 1px solid #ccc; cursor: pointer;">← Back</button>
                    <button id="clearAll" style="margin-bottom: 15px; margin-left: 10px; padding: 8px 15px; font-family: 'Montserrat'; background-color: #ffcccb; border-radius: 10px; border: 1px solid #ccc; cursor: pointer;">Clear All</button>
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
                        font-family: 'Montserrat';
                        position: relative;
                    ">
                        <div style="position: absolute; top: 8px; right: 8px; cursor: pointer; font-size: 1.5em; color: #666; user-select: none;" class="menu-btn" data-index="${index}">⋮</div>
                        <div class="menu-options" data-index="${index}" style="
                            display: none;
                            position: absolute;
                            top: 35px;
                            right: 8px;
                            background: white;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                            z-index: 100;
                            overflow: hidden;
                        ">
                            <div class="menu-option edit-btn" data-index="${index}" style="padding: 10px 20px; cursor: pointer; font-size: 0.9em; border-bottom: 1px solid #eee;">✏️ Edit</div>
                            <div class="menu-option copy-btn" data-index="${index}" style="padding: 10px 20px; cursor: pointer; font-size: 0.9em; border-bottom: 1px solid #eee;">📋 Copy</div>
                            <div class="menu-option delete-btn" data-index="${index}" style="padding: 10px 20px; cursor: pointer; font-size: 0.9em; color: #d32f2f;">🗑️ Delete</div>
                        </div>
                        <div style="font-size: 0.75em; color: #666; margin-bottom: 5px; padding-right: 30px;">${clip.timestamp}</div>
                        <div style="word-wrap: break-word; padding-right: 30px;">${clip.text.substring(0, 100)}${clip.text.length > 100 ? '...' : ''}</div>
                    </div>
                `;
                    
            });
            
            clipsHTML += `
                    </div>
                    <div id="clipNotification" class="notification"></div>
                </div>
            `;
            
            // Replace the current content with clips view
            whiteContainer.innerHTML = clipsHTML;
            // Get references to notification element
            const clipNotification = document.getElementById('clipNotification');
            
            // Toggle menu when clicking the three-dot button
            const menuBtns = document.querySelectorAll('.menu-btn');
            menuBtns.forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = this.getAttribute('data-index');
                    const menu = document.querySelector(`.menu-options[data-index="${index}"]`);
                    
                    // Close all other menus
                    document.querySelectorAll('.menu-options').forEach(m => {
                        if (m !== menu) m.style.display = 'none';
                    });
                    
                    // Toggle this menu
                    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                });
            });
            
            // Close menus when clicking outside
            document.addEventListener('click', function() {
                document.querySelectorAll('.menu-options').forEach(m => m.style.display = 'none');
            });
            
            // Handle Edit button
            const editBtns = document.querySelectorAll('.edit-btn');
            editBtns.forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = parseInt(this.getAttribute('data-index'));
                    const clip = clips[index];
                    
                    // edit modal (...)
                    const modal = document.createElement('div');
                    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
                    modal.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 15px; width: 80%; max-width: 400px; font-family: Montserrat;">
                            <h3 style="margin-top: 0;">Edit Clip</h3>
                            <textarea id="editTextarea" style="width: 100%; height: 150px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-family: MOntserrat; resize: none; box-sizing: border-box;">${clip.text}</textarea>
                            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                                <button id="cancelEdit" style="padding: 8px 20px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; font-family: Montserrat;">Cancel</button>
                                <button id="saveEdit" style="padding: 8px 20px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: Montserrat;">Save</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                    
                    // Focus on textarea
                    document.getElementById('editTextarea').focus();
                    
                    // Cancel button - close edit pop up
                    document.getElementById('cancelEdit').addEventListener('click', function() {
                        modal.remove();
                    });
                    
                    // Close pop up / modal when clicking outside
                    modal.addEventListener('click', function(e) {
                        if (e.target === modal) {
                            modal.remove();
                        }
                    });

                    // Save Edited Text button
                    document.getElementById('saveEdit').addEventListener('click', function() {
                        const newText = document.getElementById('editTextarea').value;
                        if (newText.trim() !== '') {
                            clips[index].text = newText;
                            clips[index].timestamp = new Date().toLocaleString();
                            chrome.storage.local.set({ clips: clips }, function() {
                                modal.remove();
                                location.reload();
                            });
                        }
                    });
                });
            });
            
            //copy text option
            const copyBtns = document.querySelectorAll('.copy-btn');
            copyBtns.forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = parseInt(this.getAttribute('data-index'));
                    const clipText = clips[index].text;
                    
                    navigator.clipboard.writeText(clipText).then(function() {
                        clipNotification.textContent = 'Copied to clipboard! ✨';
                        clipNotification.classList.add('show');
                        setTimeout(() => {
                            clipNotification.classList.remove('show');
                        }, 2000);
                    });
                    
                    // Close menu
                    document.querySelectorAll('.menu-options').forEach(m => m.style.display = 'none');
                });
            });
            
            // Handle Delete button
            const deleteBtns = document.querySelectorAll('.delete-btn');
            deleteBtns.forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = parseInt(this.getAttribute('data-index'));
                    // delete confirmation modal
                    const deleteModal = document.createElement('div');
                    deleteModal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
                    deleteModal.innerHTML = `
                        <div style="background: white; padding: 25px; border-radius: 15px; width: 80%; max-width: 350px; font-family: Montserrat; text-align: center;">
                            <h3 style="margin-top: 0; color: #d32f2f;">Delete this clip?</h3>
                            <p style="color: #666; margin: 15px 0;">This action cannot be undone.</p>
                            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                                <button id="cancelDelete" style="padding: 10px 25px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; font-family: Montserrat; font-size: 1em;">Cancel</button>
                                <button id="confirmDelete" style="padding: 10px 25px; background: #d32f2f; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: Montserrat; font-size: 1em;">Delete</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(deleteModal);

                    // Cancel button
                    document.getElementById('cancelDelete').addEventListener('click', () => deleteModal.remove());
                    
                    // Confirm delete button
                    document.getElementById('confirmDelete').addEventListener('click', function() {
                        clips.splice(index, 1);
                        chrome.storage.local.set({ clips: clips }, function() {
                            deleteModal.remove();
                            location.reload();
                        });
                    });
                    
                    // Close menu
                    document.querySelectorAll('.menu-options').forEach(m => m.style.display = 'none');
                });
            });
            
            // Add hover effects to menu options
            const menuOptions = document.querySelectorAll('.menu-option');
            menuOptions.forEach(function(option) {
                option.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#f5f5f5';
                });
                option.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'white';
                });
            });
            
            
            // Back button to return to main view
            document.getElementById('backButton').addEventListener('click', function() {
                location.reload();
            });
            
            // Clear all clips button
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