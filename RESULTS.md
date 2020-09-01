# Results

> process 1 million data generated records (each slice should process more and more)

## JSON TABLE

**execution time:** 33s

**final memory:** 1.04GB

```js
operation table_reader
average completion time of: 18.1 ms, min: 12 ms, and max: 63 ms
average size: 5000, min: 5000, and max: 5000
average memory: 4783316.48, min: -182896896, and max: 17722864

operation table_action (sum)
average completion time of: 33.62 ms, min: 1 ms, and max: 153 ms
average size: 1, min: 1, and max: 1
average memory: -6792912.6, min: -458011064, and max: 15180720

operation table_action (filter)
average completion time of: 31.73 ms, min: 2 ms, and max: 67 ms
average size: 1, min: 1, and max: 1
average memory: 205552.12, min: -14783544, and max: 17145808

operation table_action (transform)
average completion time of: 59.12 ms, min: 1 ms, and max: 124 ms
average size: 1, min: 1, and max: 1
average memory: 3988634.2, min: -12865456, and max: 20495088
```

## ARROW TABLE:

**execution time:** 415s

**final memory:** 519 MB

```js
operation table_reader
average completion time of: 77.86 ms, min: 44 ms, and max: 695 ms
average size: 5000, min: 5000, and max: 5000
average memory: 4167160.36, min: -352884456, and max: 16380784

operation table_action (sum)
average completion time of: 43.88 ms, min: 1 ms, and max: 158 ms
average size: 1, min: 1, and max: 1
average memory: -3840661.2, min: -16082696, and max: 15297216

operation table_action (filter)
average completion time of: 21.35 ms, min: 1 ms, and max: 77 ms
average size: 1, min: 1, and max: 1
average memory: 239098.72, min: -16534280, and max: 15512120

operation table_action (transform)
average completion time of: 1863.73 ms, min: 36 ms, and max: 4313 ms
average size: 1, min: 1, and max: 1
average memory: 28691814.8, min: -395893224, and max: 214816024
```
