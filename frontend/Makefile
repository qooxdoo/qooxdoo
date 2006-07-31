all: api demo framework

api:
	$(MAKE) -C api build

demo:
	$(MAKE) -C demo build

framework:
	$(MAKE) -C framework build

clean:
	$(MAKE) -C api clean
	$(MAKE) -C demo clean
	$(MAKE) -C framework clean

realclean:
	$(MAKE) -C api realclean
	$(MAKE) -C demo realclean
	$(MAKE) -C framework realclean

	rm -rf .cache
