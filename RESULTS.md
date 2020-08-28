# Results

> process 2 million data generated records (each slice should process more and more)

## JSON TABLE

**execution time:** 1hr 10min 47seconds
**final memory:** 1.36GB

operation elasticsearch_data_generator
average completion time of: 20.16 ms, min: 4 ms, and max: 372 ms
average size: 5000, min: 5000, and max: 5000
average memory: -9693459.53, min: -917823376, and max: 2303536

operation table_action (store in table)
average completion time of: 1562.51 ms, min: 9 ms, and max: 4167 ms
average size: 5000, min: 5000, and max: 5000
average memory: 121269175.45, min: -784192144, and max: 240682168

operation table_action (sum field)
average completion time of: 982.48 ms, min: 2 ms, and max: 6908 ms
average size: 1, min: 1, and max: 1
average memory: -150573521.29, min: -1117553944, and max: 16693368

operation table_action (filter table)
average completion time of: 1604.9 ms, min: 3 ms, and max: 7257 ms
average size: 405785, min: 5000, and max: 820000
average memory: 44851417.69, min: -987425552, and max: 190831400


## ARROW TABLE:

**execution time:**
**final memory:**
