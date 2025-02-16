document.getElementById('fetchButton').addEventListener('click', fetchCommits);

async function fetchCommits() {
    const username = document.getElementById('username').value;
    const logsDiv = document.getElementById('logs');
    const commitInfoDiv = document.getElementById('commitInfo');

    // Clear previous logs and commit info
    logsDiv.innerHTML = '';
    commitInfoDiv.innerHTML = '';

    // Log the start of the fetch process
    logMessage(logsDiv, 'Fetching commits for ' + username + '...');

    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`https://api.github.com/search/commits?q=author:${username}+committer-date:${today}`);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            logMessage(logsDiv, 'Commits found:');
            let totalLines = 0;

            data.items.forEach(commit => {
                const commitDate = new Date(commit.commit.committer.date).toLocaleString();
                const commitMessage = commit.commit.message;
                const additions = commit.stats.additions;
                const deletions = commit.stats.deletions;
                const total = additions + deletions;

                totalLines += total;

                logMessage(logsDiv, `Commit: ${commitMessage} (Date: ${commitDate}, Additions: ${additions}, Deletions: ${deletions}, Total: ${total})`);
            });

            commitInfoDiv.innerHTML = `<p>Total lines committed today: ${totalLines}</p>`;
        } else {
            logMessage(logsDiv, 'No commits found for today.');
            commitInfoDiv.innerHTML = '<p>No commits today.</p>';
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