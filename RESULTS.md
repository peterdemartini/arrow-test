# Results

> process 1 million data generated records (each slice should process more and more)

## JSON TABLE

**execution time:** 130s

```js
operation table_reader
average completion time of: 105.55 ms, min: 17 ms, and max: 390 ms
average size: 5000, min: 5000, and max: 5000
average memory: 24833621.2, min: -552175368, and max: 60114096

operation table_action (sum)
average completion time of: 129.85 ms, min: 2 ms, and max: 521 ms
average size: 1, min: 1, and max: 1
average memory: -21671050.56, min: -661372040, and max: 14599248

operation table_action (filter)
average completion time of: 153.21 ms, min: 2 ms, and max: 945 ms
average size: 1, min: 1, and max: 1
average memory: 759332.68, min: -14458296, and max: 16174880

operation table_action (transform)
average completion time of: 231.9 ms, min: 2 ms, and max: 742 ms
average size: 1, min: 1, and max: 1
average memory: 4232535.72, min: -13390696, and max: 19596584
```

## ARROW TABLE:

**execution time:** 407s

```js
operation table_reader
average completion time of: 76.22 ms, min: 45 ms, and max: 865 ms
average size: 5000, min: 5000, and max: 5000
average memory: 4401172.04, min: -505489672, and max: 16355912

operation table_action (sum)
average completion time of: 45.64 ms, min: 1 ms, and max: 372 ms
average size: 1, min: 1, and max: 1
average memory: -4436759.24, min: -238921232, and max: 14035768

operation table_action (filter)
average completion time of: 21.39 ms, min: 1 ms, and max: 96 ms
average size: 1, min: 1, and max: 1
average memory: -73317.16, min: -16501456, and max: 5139616

operation table_action (transform)
average completion time of: 1834.13 ms, min: 35 ms, and max: 4638 ms
average size: 1, min: 1, and max: 1
average memory: 18031675.88, min: -407134088, and max: 219275240
```

## SIMPLE COLUMNAR TABLE:

**execution time:** x

```js
operation table_reader
average completion time of: 2400.66 ms, min: 32 ms, and max: 13752 ms
average size: 5000, min: 5000, and max: 5000
average memory: 263740219.64, min: -212582144, and max: 504705360

operation table_action (sum)
average completion time of: 162.18 ms, min: 2 ms, and max: 486 ms
average size: 1, min: 1, and max: 1
average memory: -252168617.8, min: -1058997704, and max: 16599336

operation table_action (filter)
average completion time of: 324.62 ms, min: 9 ms, and max: 980 ms
average size: 1, min: 1, and max: 1
average memory: 4171845.96, min: -12841168, and max: 21425056

operation table_action (transform)
average completion time of: 164.67 ms, min: 3 ms, and max: 579 ms
average size: 1, min: 1, and max: 1
average memory: 4318935.04, min: -13501248, and max: 19228864
```
