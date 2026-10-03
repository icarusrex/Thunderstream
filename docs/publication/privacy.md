# Privacy-safe publication

The old history is retained privately as Thunderstream-history-backup, never deleted. The replacement Thunderstream repository has fresh web commit history, with Keep my email addresses private enabled before its first commit. Verify every remote author/committer after publication; revert visibility to private if the check fails. Changes cannot erase earlier clones or external caches.

Local release preparation creates a parentless commit from the verified source tree with noreply author and committer. Only that root is exported to thunderstream-source.zip and thunderstream-clean-history.bundle; neither includes earlier history. XPI packages contain only their own source folder. SHA256SUMS.txt binds the uploaded files to the verified build. The public GitHub tree currently contains archives, not unpacked source; CI is inactive there.

A future maintainer can recover a normal source checkout from the clean bundle and push it when repository write access is available. The parentless source commit is the source archive's ZIP comment. Do not push the private backup history back to the public repository.
