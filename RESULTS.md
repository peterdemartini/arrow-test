# Results

> process 5 million data generated records (each slice should process more and more)

## JSON TABLE

**execution time:** 6m 41s

**final memory:** 1.01GB

operation elasticsearch_data_generator
average completion time of: 13.17 ms, min: 4 ms, and max: 207 ms
average size: 5000, min: 5000, and max: 5000
average memory: -19352662.53, min: -985080736, and max: 1927536

operation table_action (store in table)
average completion time of: 42.17 ms, min: 5 ms, and max: 537 ms
average size: 5000, min: 5000, and max: 5000
average memory: 3302320.73, min: -902457504, and max: 47161504

operation table_action (sum field)
average completion time of: 156.21 ms, min: 1 ms, and max: 475 ms
average size: 1, min: 1, and max: 1
average memory: 2488.3, min: 40, and max: 560096

operation table_action (filter and return count)
average completion time of: 191.12 ms, min: 1 ms, and max: 1549 ms
average size: 1, min: 1, and max: 1
average memory: 40003766.84, min: -751624288, and max: 167678432


## ARROW TABLE:

**execution time:** 4m 56s

**final memory:** 858MB

operation elasticsearch_data_generator
average completion time of: 8.5 ms, min: 4 ms, and max: 86 ms
average size: 5000, min: 5000, and max: 5000
average memory: 469697.4, min: -70821832, and max: 2368496

operation table_action (store in table)
average completion time of: 65.31 ms, min: 31 ms, and max: 197 ms
average size: 5000, min: 5000, and max: 5000
average memory: 3579127.66, min: -6639312, and max: 13320392

operation table_action (sum field)
average completion time of: 182.38 ms, min: 1 ms, and max: 529 ms
average size: 1, min: 1, and max: 1
average memory: -1047148.33, min: -13289824, and max: 15670104

operation table_action (filter and return count)
average completion time of: 90.02 ms, min: 1 ms, and max: 277 ms
average size: 1, min: 1, and max: 1
average memory: 26853.11, min: -16562504, and max: 4344216
