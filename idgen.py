import string
import random as r
def gen():
  end = ''
  rnge = r.randint(15, 20)
  for i in range(rnge):
    end += r.choice(string.digits + string.ascii_letters)
  return end