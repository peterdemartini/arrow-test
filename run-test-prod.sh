#!/bin/bash

set -e

run_job() {
    local job_file="$1"

    echo "* RUN JOB $job_file"
    if teraslice-cli tjm view "$job_file" &> /dev/null; then
        teraslice-cli tjm update "$job_file" --start &
    else
        teraslice-cli tjm register tera4 "$job_file" --start &
    fi
}

main() {
    local asset_version;
    asset_version="$(jq '.version' ./asset/package.json)"

    if teraslice-cli assets list tera4 | grep 'arrow-test' | grep "$asset_version"; then
        echo '* using the existing asset (make sure to bump)'
        sleep 5
    else
        teraslice-cli assets deploy tera4 --build --blocking
    fi

    run_job "json-job.json"
    run_job "simple-job.json"
    run_job "arrow-job.json"

    wait
}

main "$@"
