document.getElementById('fetchButton').addEventListener('click', fetchCommits);

async function fetchCommits() {
    const logsDiv = document.getElementById('logs');
    const commitInfoDiv = document.getElementById('commitInfo');
    const authTokenInput = document.getElementById('authToken');
    
    // GitHub API configuration
    const owner = 'aipechu';
    const repo = 'DocAssist';
    const branch = 'doc-160';
    const authToken = authTokenInput.value;
    
    if (!authToken) {
        logMessage(logsDiv, 'Please enter a GitHub auth token');
        return;
    }
    
    // Clear previous logs and commit info
    logsDiv.innerHTML = '';
    commitInfoDiv.innerHTML = '';
    
    // Get start of current day in IST
    const now = new Date();
    now.setHours(0, 0, 0, 0);  // Set to start of day in local timezone
    const startOfDay = now.toISOString();  // Convert to ISO string for GitHub API
    
    logMessage(logsDiv, `Fetching today's commits for ${owner}/${repo} on branch ${branch}...`);

    try {
        // Fetch commits for the branch with since parameter
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&since=${startOfDay}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        const commits = await response.json();
        
        if (commits && commits.length > 0) {
            logMessage(logsDiv, 'Today\'s Commits:');
            let totalLines = 0;

            // Process each commit
            for (const commit of commits) {
                // Fetch detailed commit information
                const detailResponse = await fetch(
                    `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                const commitDetail = await detailResponse.json();
                
                const {
                    stats,
                    commit: { author, message }
                } = commitDetail;
                
                // Simplified time conversion using local timezone
                const commitDate = new Date(author.date);
                const timeString = commitDate.toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Kolkata'  // Explicitly set to IST
                });
                
                const additions = stats?.additions || 0;
                const deletions = stats?.deletions || 0;
                const total = additions + deletions;
                
                totalLines += total;

                logMessage(logsDiv, `${timeString} - ${message}\nLines changed: ${total}`);
            }

            commitInfoDiv.innerHTML = `
                <p>Total lines changed today: ${totalLines}</p>
                <p>Total commits today: ${commits.length}</p>
            `;
        } else {
            logMessage(logsDiv, 'No commits found for today.');
            commitInfoDiv.innerHTML = '<p>No commits found for today.</p>';
        }
    } catch (error) {
        logMessage(logsDiv, 'Error fetching commits: ' + error.message);
        commitInfoDiv.innerHTML = '<p>Error fetching commits.</p>';
    }
}

function logMessage(div, message) {
    const logEntry = document.createElement('p');
    logEntry.textContent = message;
    div.appendChild(logEntry);
}