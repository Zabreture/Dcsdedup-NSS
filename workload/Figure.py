#%%
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib import rcParams


storeData = pd.read_csv('../eval/store.txt')
retData = pd.read_csv('../eval/retrieve.txt')

#%%
length = retData['mle'].size - 1
xLabels = [
'$2^0$','$2^1$','$2^2$','$2^3$',
'$2^4$','$2^5$','$2^6$','$2^7$',
'$2^8$','$2^9$','$2^{10}$','$2^{11}$',
'$2^{12}$','$2^{13}$','$2^{14}$','$2^{15}$',
]
config = {
    "font.family":'Times New Roman',
    "font.size": 16,
    "mathtext.fontset":'stix',
    "font.serif": ['Times New Roman'],
}
rcParams.update(config)
plt.figure(1,[6*1.3,4*1])
plt.ylabel('Time cost (ms)')
plt.xlabel('Uploaded file size (KB)')
plt.xticks(range(length), xLabels)
plt.grid(axis='y')
plt.tick_params(bottom=False, left=False)
plt.plot(range(length), (storeData['plaintext'][0:16]),'^-')
plt.plot(range(length), (storeData['mle'][0:16]),'D-')
plt.plot(range(length), (storeData['dupless'][0:16]),'s-')
plt.plot(range(length), (storeData['dcsdedup'][0:16]),'o-')
plt.legend(['Plaintext $+$ IPFS','MLE $+$ IPFS','DupLESS $+$ IPFS','Our design'])
plt.ylim([0,1200])
plt.tight_layout()
plt.savefig(r'D:\Projects\javascript\dcsdedup-asiaccs2023\workload\store.svg',bbox_inches='tight')
plt.show()

#%%
plt.figure(2)
plt.plot(range(0,length), (retData['plaintext'][0:16]))
plt.plot(range(0,length), (retData['mle'][0:16]))
plt.plot(range(0,length), (retData['dupless'][0:16]))
plt.plot(range(0,length), (retData['dcsdedup'][0:16]))
# plt.ylim([4,12])
plt.tight_layout()
plt.savefig('retrieve.pdf')
plt.show()
for (size,time) in zip(range(16),storeData['dcsdedup']):
    # print('Speed: ' + str(2**size/1024*1000/time))
    print('Size: ' + str(2**size) + ',   ' + str(411/time))