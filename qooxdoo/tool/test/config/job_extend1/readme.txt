test correct job shadowing and merging:
- tests the expansion of a single job over several chained config files, using the same
  job name in all configs ("job shaddowing")
- the job is implicitly extended with the job of same name in the imported
	config. this causes the job features to be merged. the test is about whether
	these operations are correct.
- undefined features in the importing config are just added
- defined features in the importing config are merged with those of the imported job
  of same	name
- features protected with leading "=" override the feature of same name
