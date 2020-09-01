#!/bin/bash

set -e

run_job() {
    local job_file="$1"

    echo "* RUN JOB $job_file"
    if teraslice-cli tjm view "$job_file" &> /dev/null; then
        teraslice-cli tjm update "$job_file" --start
    else
        teraslice-cli tjm register tera4 "$job_file" --start
    fi
}

main() {
    teraslice-cli assets deploy tera4 --build --replace --dev --blocking

    run_job "json-job.json"
    run_job "simple-job.json"
    run_job "arrow-job.json"
}

main "$@"
