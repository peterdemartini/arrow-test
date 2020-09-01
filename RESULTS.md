# Results

> process 1 million data generated records (each slice should process more and more)

## JSON TABLE

**execution time:** 135s
**final memory:** xMB

```js
operation table_reader
average completion time of: 11.54 ms, min: 7 ms, and max: 107 ms
average size: 5000, min: 5000, and max: 5000
average memory: 553988.44, min: -101293168, and max: 91283240

operation table_action
average completion time of: 32.74 ms, min: 1 ms, and max: 166 ms
average size: 1, min: 1, and max: 1
average memory: -4097182.36, min: -328369864, and max: 15865016

operation table_action
average completion time of: 84.72 ms, min: 5 ms, and max: 293 ms
average size: 1, min: 1, and max: 1
average memory: 4314154.88, min: -10806144, and max: 21493768

operation table_action
average completion time of: 31.83 ms, min: 1 ms, and max: 239 ms
average size: 1, min: 1, and max: 1
average memory: 476797.52, min: -14810976, and max: 12019920
```

## ARROW TABLE:

**execution time:** 401s
**final memory:** xGB

```js
operation table_reader
average completion time of: 81.26 ms, min: 46 ms, and max: 599 ms
average size: 5000, min: 5000, and max: 5000
average memory: 4242867.84, min: -358807376, and max: 16349232

operation table_action
average completion time of: 46.65 ms, min: 1 ms, and max: 163 ms
average size: 1, min: 1, and max: 1
average memory: -3989017.8, min: -15194688, and max: 14753112

operation table_action
average completion time of: 20.24 ms, min: 1 ms, and max: 45 ms
average size: 1, min: 1, and max: 1
average memory: -244216.8, min: -16649384, and max: 5154520

operation table_action
average completion time of: 1782.43 ms, min: 57 ms, and max: 4468 ms
average size: 1, min: 1, and max: 1
average memory: 32824293.72, min: -417137168, and max: 211367184
```

## SIMPLE COLUMNAR TABLE:

**execution time:** 510s
**final memory:** 1.32GB

```js
operation table_reader
average completion time of: 2091.81 ms, min: 28 ms, and max: 4266 ms
average size: 5000, min: 5000, and max: 5000
average memory: 264743028.6, min: -892384, and max: 504852056

operation table_action (sum)
average completion time of: 111.01 ms, min: 1 ms, and max: 268 ms
average size: 1, min: 1, and max: 1
average memory: -262910265.04, min: -1053980032, and max: 16391296

operation table_action (filter)
average completion time of: 224.17 ms, min: 6 ms, and max: 471 ms
average size: 1, min: 1, and max: 1
average memory: 3470285.8, min: -13123640, and max: 18670560

operation table_action (transform)
average completion time of: 95.51 ms, min: 1 ms, and max: 196 ms
average size: 1, min: 1, and max: 1
average memory: 4490720.8, min: -12546384, and max: 20911904
```
