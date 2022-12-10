import math
import os
import pandas as pd

paths = {'golang': 'E:/TestData/GoLang/',
		'kernel': 'E:/TestData/Kernel-debug/',
		'mysql': 'E:/TestData/MySQL/',
		'node':'E:/TestData/Node/'}

def readData(name):
	filePath = paths[name]
	nameSets = []
	datasets = []
	for i,j,k in os.walk(filePath):
		nameSets = k
		break
	for name in nameSets:
		fullPath = filePath + name
		print(fullPath)
		datasets.append(pd.read_csv(fullPath))
	return datasets

#%% GoLang read data
datasets = readData('golang')
allInOne = pd.DataFrame()
avgSize = 0
for subsets in datasets:
	allInOne = pd.concat([allInOne, subsets])
	avgSize = avgSize + subsets['size'].sum()/len(datasets)/1024/1024
avgSize = round(avgSize, 2)
print(allInOne)

#%% Merge all subsets together
num = round(allInOne['size'].size/1000, 2)
sumSize = round(allInOne['size'].sum()/1024/1024/1024, 2)
dupSize = round(allInOne
				.drop_duplicates(subset=['hash'],keep='first')['size']
				.sum()/1024/1024/1024, 2)
print(f'Total size: {sumSize} GB')
print(f'Total files: {num}')
print(f'Average size: {avgSize} MB')
print(f'Duplicate ratio: {round(1-dupSize/sumSize,4)}')

