from flask import Flask, render_template, redirect, request
from bson.objectid import ObjectId
import pymongo
import json
import os
if os.path.isfile('mongouri.txt'):
  connectionstring = open('mongouri.txt').read().strip()
else:
  connectionstring = os.environ.get('MONGO_URI')
cluster = pymongo.MongoClient(connectionstring)
database = cluster['replit-mining-flask-game']
userscol = database['users']
users = {}
for i in userscol.find():
  users[str(i['_id'])] = i
print(users)
def save():
  for i in users:
    userinfo = users[i]
    userinfo = userinfo.copy()
    del userinfo['_id']
    userscol.update_one({'_id':ObjectId(i)}, {"$set":users[i]})
def addattr(attr, val):
  for user in users:
    users[user][attr] = val

app = Flask('app')

@app.route('/')
def hello_world():
  return render_template('index.html')

@app.route('/world')
def world():
  return render_template('world.html')

@app.route('/signup', methods=['GET','POST'])
def signup():
  if request.method == 'POST':
    unms = []
    for i in users:
      unms.append(users[i]['username'])
    username = request.form['username']
    if username in unms:
      return 'Username already exists'
    password = request.form['password']
    userdata = {
      "username":username,
      "password":password,
      "items":[],
      "blocks":{"grass":0,"dirt":0,"wood":0},
      "xp":0,
      "level":1,
      "pos":[0,0],
      "map":[],
      "meat":{"cow":0,"panda":0}
    }
    userscol.insert_one(userdata)
    infotogive = userscol.find_one(userdata)
    infotogive = infotogive.copy()
    del infotogive['password']
    del infotogive['_id']
    return {str(infotogive['_id']):infotogive}
  else:
    return render_template('signup.html')

@app.route('/login', methods=['GET','POST'])
def login():
  if request.method == 'POST':
    username = request.form['username']
    password = request.form['password']
    unms = {}
    for i in users:
      unms[users[i]['username']] = i
    if username in unms:
      if users[unms[username]]['password'] == password:
        infotogive = users[unms[username]]
        infotogive = infotogive.copy()
        del infotogive['password']
        del infotogive['_id']
        return {unms[username]:infotogive}
    return 'incorrect'
  else:
    return render_template('login.html')

@app.route('/save', methods=['POST'])
def saveroute():
  uid = request.form['userid']
  users[uid]['blocks'] = json.loads(request.form['blocks'])
  users[uid]['meat'] = json.loads(request.form['meat'])
  users[uid]['items'] = json.loads(request.form['items']) if request.form['items']!='empty' else []
  users[uid]['xp'] = request.form['xp']
  users[uid]['level'] = request.form['level']
  users[uid]['pos'] = [int(x) for x in request.form['pos'].split(',')]
  users[uid]['map'] = json.loads(request.form['map'])
  save()
  infotogive = users[uid].copy()
  del infotogive['password']
  del infotogive['_id']
  return infotogive

@app.route('/user/<uid>')
def user(uid):
  infotogive = users[uid]
  infotogive = infotogive.copy()
  del infotogive['password']
  del infotogive['_id']
  return render_template('user.html', udata=infotogive)

if __name__ == '__main__':
  app.run()
