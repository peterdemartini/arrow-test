#!/bin/bash

set -e

run_job() {
    local job_file="$1"

    echo "* RUN JOB $job_file"
    if teraslice-cli tjm view "$job_file" &> /dev/null; then
        teraslice-cli tjm update "$job_file" --start
    else
        teraslice-cli tjm register localhost "$job_file" --start
    fi
    teraslice-cli tjm await "$job_file" --status completed
    echo "* JOB FINISHED $job_file"
}

main() {
    teraslice-cli assets deploy localhost --build --replace --dev --blocking

    run_job "json-job.json"
    run_job "arrow-job.json"
    run_job "simple-job.json"
}

main "$@"
