  // typing.js - Handles the typing test logic.

document.addEventListener('DOMContentLoaded', () => {
    // Only setup typing test if the necessary elements are on the current page
    if (document.getElementById('typing-test-page-container')) { // Add a wrapper ID to the test page section
        setupTypingTest();
    }
    
    // Modal button listeners (if modal is part of this page structure)
    const closeModalButton = document.getElementById('close-modal');
    const tryAgainButton = document.getElementById('try-again');
    const resultModal = document.getElementById('result-modal');

    if (closeModalButton && resultModal) {
        closeModalButton.addEventListener('click', () => resultModal.classList.remove('active'));
    }
    if (tryAgainButton && resultModal) {
        tryAgainButton.addEventListener('click', () => {
            resultModal.classList.remove('active');
            const resetTestButton = document.getElementById('reset-test');
            const startTestButton = document.getElementById('start-test');
            // Ensure these buttons exist before clicking
            if (resetTestButton) resetTestButton.click(); 
            if (startTestButton) startTestButton.click();
        });
    }
});

function setupTypingTest() {
    const startBtn = document.getElementById('start-test');
    const resetBtn = document.getElementById('reset-test');
    const typingInput = document.getElementById('typing-input');
    const wpmElement = document.getElementById('wpm');
    const accuracyElement = document.getElementById('accuracy');
    const errorsElement = document.getElementById('errors');
    const timerElement = document.getElementById('timer');
    const typingTextElement = document.getElementById('typing-text');
    
    // Validate essential elements
    if (!startBtn || !resetBtn || !typingInput || !wpmElement || !accuracyElement || !errorsElement || !timerElement || !typingTextElement) {
        console.error("One or more typing test elements are missing from the DOM for setupTypingTest.");
        return;
    }
    const originalText = typingTextElement.textContent.trim();
    
    let timerInterval;
    let timeLeft = 60; // Default test duration
    let testActive = false;
    let startTime;
    let currentTotalErrors = 0;
    let currentTotalTyped = 0;
    
    startBtn.addEventListener('click', startTest);
    resetBtn.addEventListener('click', resetTest);
    typingInput.addEventListener('input', updateTyping);
    
    function startTest() {
        if (testActive) return;
        testActive = true;
        startBtn.textContent = 'Test Running...';
        startBtn.disabled = true;
        typingInput.disabled = false;
        typingInput.value = '';
        typingInput.focus();
        
        timeLeft = 60; // Reset timer for each start
        timerElement.textContent = timeLeft;
        wpmElement.textContent = '0';
        accuracyElement.textContent = '100%';
        errorsElement.textContent = '0';
        currentTotalErrors = 0;
        currentTotalTyped = 0;
        startTime = Date.now();
        typingTextElement.innerHTML = originalText; // Reset text highlighting
        
        clearInterval(timerInterval); // Clear any existing timer
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                typingInput.disabled = true;
                testActive = false;
                showAndSaveTestResults(); 
            }
        }, 1000);
    }
    
    function resetTest() {
        clearInterval(timerInterval);
        testActive = false;
        typingInput.disabled = true;
        typingInput.value = '';
        timeLeft = 60;
        timerElement.textContent = timeLeft;
        wpmElement.textContent = '0';
        accuracyElement.textContent = '100%';
        errorsElement.textContent = '0';
        startBtn.textContent = 'Start Test';
        startBtn.disabled = false;
        currentTotalErrors = 0;
        currentTotalTyped = 0;
        typingTextElement.innerHTML = originalText;
    }
    
    function updateTyping() {
        if (!testActive) return;
        
        const typedText = typingInput.value;
        currentTotalTyped = typedText.length;
        let newHTML = '';
        let instantaneousErrors = 0; // Errors in the current input string
        
        for (let i = 0; i < originalText.length; i++) {
            if (i < typedText.length) {
                if (typedText[i] === originalText[i]) {
                    newHTML += `<span class="correct">${originalText[i]}</span>`;
                } else {
                    newHTML += `<span class="incorrect">${originalText[i]}</span>`;
                    instantaneousErrors++;
                }
            } else if (i === typedText.length) { // Current character to be typed
                newHTML += `<span class="current">${originalText[i]}</span>`;
            } else { // Characters not yet typed
                newHTML += originalText[i];
            }
        }
        typingTextElement.innerHTML = newHTML;
        currentTotalErrors = instantaneousErrors; // Update the main error count
        
        // Calculate accuracy: (correctly typed chars / total typed chars)
        const accuracy = currentTotalTyped > 0 
            ? Math.max(0, Math.round(((currentTotalTyped - currentTotalErrors) / currentTotalTyped) * 100))
            : 100;
        
        // Calculate WPM
        const timeElapsedSeconds = (Date.now() - startTime) / 1000;
        const minutes = timeElapsedSeconds / 60;
        // WPM = ( (total characters typed / 5) - errors ) / minutes
        // A common way is (correct words / minutes). A "word" is often counted as 5 chars.
        const correctChars = currentTotalTyped - currentTotalErrors;
        const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
        
        wpmElement.textContent = Math.max(0, wpm); // WPM can't be negative
        accuracyElement.textContent = `${accuracy}%`;
        errorsElement.textContent = currentTotalErrors;
    }
    
    // Displays results in modal and saves them
    function showAndSaveTestResults() {
        const finalWPM = parseInt(wpmElement.textContent) || 0;
        const finalAccuracy = accuracyElement.textContent || "0%";
        const finalErrors = parseInt(errorsElement.textContent) || 0;
        const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const duration = '1 min'; // Assuming fixed 60s test

        // Update modal elements
        const resultWpmEl = document.getElementById('result-wpm');
        const resultAccuracyEl = document.getElementById('result-accuracy');
        const resultErrorsEl = document.getElementById('result-errors');
        const resultTimeEl = document.getElementById('result-time'); 
        const resultModalEl = document.getElementById('result-modal');
        const modalSaveMessageEl = document.getElementById('modal-save-message');

        if(resultWpmEl) resultWpmEl.textContent = finalWPM;
        if(resultAccuracyEl) resultAccuracyEl.textContent = finalAccuracy;
        if(resultErrorsEl) resultErrorsEl.textContent = finalErrors;
        if(resultTimeEl) resultTimeEl.textContent = `${60 - (timeLeft > 0 ? timeLeft : 0)}s`; // Show actual time or 60s

        // Save results to localStorage if user is logged in
        const currentUserName = localStorage.getItem('userName');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (modalSaveMessageEl) modalSaveMessageEl.textContent = ''; // Clear previous message

        if (isLoggedIn && currentUserName) {
            const newResult = {
                date: currentDate,
                duration: duration,
                wpm: finalWPM,
                accuracy: finalAccuracy,
                errors: finalErrors
            };
            let userResults = JSON.parse(localStorage.getItem(`userTestResults_${currentUserName}`)) || [];
            userResults.unshift(newResult); // Add new result to the beginning
            // Optional: Limit the number of stored results, e.g., to last 20
            // if (userResults.length > 20) userResults = userResults.slice(0, 20); 
            localStorage.setItem(`userTestResults_${currentUserName}`, JSON.stringify(userResults));
            if (modalSaveMessageEl) modalSaveMessageEl.textContent = 'Results saved to your profile!';
        } else {
             if (modalSaveMessageEl) modalSaveMessageEl.textContent = 'Log in to save your results.';
        }
        
        if(resultModalEl) resultModalEl.classList.add('active'); // Show the modal
    }
}