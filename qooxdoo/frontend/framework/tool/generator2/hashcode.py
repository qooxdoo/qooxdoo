import sha

def convert(string):
    return sha.new(string).hexdigest()
    