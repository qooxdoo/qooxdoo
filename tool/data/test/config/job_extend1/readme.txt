tests the expansion of a job over several chained config files, using the same
job name in all configs ("job shaddowing"). the job is implicitly extended with
the job of same name in the imported config. this causes the job features to be
merged. the test is about whether these operations are correct.
