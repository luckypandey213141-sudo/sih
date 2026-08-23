/**
 * SafeWay - GitHub Project Uploader (Project: sih)
 * Creates and pushes all source code to a repository named 'sih' on your GitHub account.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_NAME = process.env.REPO_NAME || 'sih';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.argv[2];

if (!GITHUB_TOKEN) {
  console.log(`\n======================================================`);
  console.log(`  SafeWay -> GitHub Uploader (Repo: ${REPO_NAME})`);
  console.log(`======================================================`);
  console.log(`\nTo push this project to your GitHub account:`);
  console.log(`1. Generate a GitHub Personal Access Token (classic or fine-grained)`);
  console.log(`   URL: https://github.com/settings/tokens`);
  console.log(`   Scope: Select 'repo' permissions.`);
  console.log(`\n2. Run this command in your terminal or provide the token:`);
  console.log(`   node upload_to_github.js YOUR_GITHUB_TOKEN\n`);
  process.exit(1);
}

async function githubRequest(endpoint, method = 'GET', data = null) {
  const url = `https://api.github.com${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'SafeWay-App-Uploader',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`GitHub API Error (${res.status}): ${body.message || JSON.stringify(body)}`);
  }
  return body;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.system_generated') {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (!file.endsWith('.log') && file !== 'upload_to_github.js') {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function main() {
  try {
    console.log(`\n[1/5] 🔑 Verifying GitHub authentication...`);
    const user = await githubRequest('/user');
    console.log(`      Authenticated as GitHub User: @${user.login} (${user.name || user.login})`);

    console.log(`\n[2/5] 📦 Checking / Creating repository '${REPO_NAME}'...`);
    let repo;
    try {
      repo = await githubRequest(`/repos/${user.login}/${REPO_NAME}`);
      console.log(`      Repository '${REPO_NAME}' already exists at: ${repo.html_url}`);
    } catch (err) {
      console.log(`      Creating new repository '${REPO_NAME}' on @${user.login}...`);
      repo = await githubRequest('/user/repos', 'POST', {
        name: REPO_NAME,
        description: 'SafeWay — Smart Indoor Navigation & Emergency Evacuation System (SIH Prototype)',
        private: false,
        auto_init: true
      });
      console.log(`      Created new repository: ${repo.html_url}`);
      // Wait 2 seconds for GitHub to initialize
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`\n[3/5] 📄 Gathering project source files...`);
    const projectDir = __dirname;
    const filePaths = getAllFiles(projectDir);
    console.log(`      Found ${filePaths.length} files to upload.`);

    console.log(`\n[4/5] ☁️ Uploading files to GitHub...`);
    const treeItems = [];

    for (const filePath of filePaths) {
      const relativePath = path.relative(projectDir, filePath).replace(/\\/g, '/');
      const content = fs.readFileSync(filePath);
      const isText = !filePath.match(/\.(png|jpg|jpeg|gif|ico|pdf|zip)$/i);

      let blobData;
      if (isText) {
        blobData = await githubRequest(`/repos/${user.login}/${REPO_NAME}/git/blobs`, 'POST', {
          content: content.toString('utf8'),
          encoding: 'utf-8'
        });
      } else {
        blobData = await githubRequest(`/repos/${user.login}/${REPO_NAME}/git/blobs`, 'POST', {
          content: content.toString('base64'),
          encoding: 'base64'
        });
      }

      treeItems.push({
        path: relativePath,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha
      });
      console.log(`      ✔ Staged: ${relativePath}`);
    }

    // Get current main branch ref
    let latestCommitSha = null;
    try {
      const ref = await githubRequest(`/repos/${user.login}/${REPO_NAME}/git/ref/heads/main`);
      latestCommitSha = ref.object.sha;
    } catch (e) {
      try {
        const refMaster = await githubRequest(`/repos/${user.login}/${REPO_NAME}/git/ref/heads/master`);
        latestCommitSha = refMaster.object.sha;
      } catch (e2) {}
    }

    // Create Tree
    const tree = await githubRequest(`/repos/${user.login}/${REPO_NAME}/git/trees`, 'POST', {
      tree: treeItems,
      base_tree: latestCommitSha || undefined
    });

    // Create Commit
    const commit = await githubRequest(`/repos/${user.login}/${REPO_NAME}/git/commits`, 'POST', {
      message: 'Initial commit: SafeWay Smart Indoor Navigation & Emergency Evacuation System (SIH)',
      tree: tree.sha,
      parents: latestCommitSha ? [latestCommitSha] : []
    });

    // Update main branch ref
    try {
      await githubRequest(`/repos/${user.login}/${REPO_NAME}/git/refs/heads/main`, 'PATCH', {
        sha: commit.sha,
        force: true
      });
    } catch (e) {
      await githubRequest(`/repos/${user.login}/${REPO_NAME}/git/refs`, 'POST', {
        ref: 'refs/heads/main',
        sha: commit.sha
      });
    }

    console.log(`\n======================================================`);
    console.log(`  🎉 SUCCESS! Project uploaded to GitHub:`);
    console.log(`  👉 ${repo.html_url}`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error(`\n❌ Error uploading to GitHub:`, err.message);
    process.exit(1);
  }
}

main();
