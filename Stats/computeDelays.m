
clear all;
tr = importOscopeCSV;
t = tr(:,2);
t = t-t(1);
trel = mod(t,100e-3);
tr = [tr(:,1), t, trel, tr(:,3:size(tr,2))];


% find rising edges of received values

% for each rising edge, compute find the relative delay of that edge





% output is a matrix where each row is a rising edge
%    each column at each row is the relative delay at each receiver

%DELAYS = ....;