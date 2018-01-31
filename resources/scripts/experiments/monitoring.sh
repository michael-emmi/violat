#!/usr/bin/env bash

FLAGSS=("" --jit --weak "--weak --min" '--jit --weak --min')
EXCLUDES=(SynchronousQueue PriorityBlockingQueue LinkedBlockingDeque LinkedTransferQueue LinkedBlockingQueue ConcurrentArrayBlockingQueue)

echo ---
echo Generating experimental data
echo ---

mkdir -p ./violat-output/histories
mkdir -p ./violat-output/results

if [[ -z $(find ./violat-output/histories -name "*.json") ]]
then
  for spec in $(find ./resources/specs -name "*.json")
  do
    if [[ ${EXCLUDES[@]} =~ $(basename $spec .json) ]]
    then
      echo ---
      echo Skipping $(basename $spec .json)
      echo ---
    else
      echo ---
      echo Collecting histories from $(basename $spec .json)
      echo ---
      violat-histories $spec
    fi
  done
else
  echo ---
  echo Refusing to interfere with existing traces
  echo ---
fi

if [[ -z $(find ./violat-output/results -name "*.json") ]]
then
  for run in $(find ./violat-output/histories -name "run-*")
  do
    echo ---
    echo Checking histories from $(basename $run)
    echo ---

    for flags in "${FLAGSS[@]}"
    do
      echo ---
      echo Running checker with flags: $flags
      echo ---
      find $run -name "*.json" | xargs violat-history-checker $flags
    done
  done
else
  echo ---
  echo Refusing to interfere with existing results
  echo ---
fi
