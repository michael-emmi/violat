ROOT="$(dirname "${BASH_SOURCE[0]}")/.."

SPEC=java/util/concurrent/ConcurrentSkipListMap.json
METHOD=clear
SEQUENCES=2
INVOCATIONS=2

HARNESS="${SPEC/.json/.${METHOD}.${SEQUENCES}.${INVOCATIONS}.json}"

# prepare directories
mkdir -p harnesses/$(dirname ${HARNESS})
rm -f $(find harnesses -name "*.json")
(cd ${ROOT}/jcstress && rm -f $(find src -name "*StressTests.java"))

# compile jcsgen
(cd ${ROOT}/jcsgen && gradle)

# enumerate harnesses
node ${ROOT}/bin/harness-enumerator.js \
  --spec specs/${SPEC} \
  --method ${METHOD} \
  --sequences ${SEQUENCES} \
  --invocations ${INVOCATIONS} \
  > harnesses/${HARNESS}

# translate harnesses
./${ROOT}/jcsgen/build/install/jcsgen/bin/jcsgen \
  harnesses/${HARNESS} \
  --path ${ROOT}/jcstress/src/main/java/

# compile harnesses
(cd ${ROOT}/jcstress && mvn clean install)

# run harnesses
node ${ROOT}/bin/jcstress-runner.js \
  --path jcstress/
